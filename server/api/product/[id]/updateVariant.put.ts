import { serverSupabaseClient } from '#supabase/server';
import { and, eq } from 'drizzle-orm';
import { productVariants, updateVariantSchema } from '~~/db/schema';
import { useAuthDB } from '~~/server/utils/db';
import { buildVariantSku } from '~~/db/utils/sku';

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const body = await readBody(event);
  console.log({ body });
  const payload = updateVariantSchema.parse(body);
  console.log({ payload });

  const productId = getRouterParam(event, 'id');

  return await useAuthDB(user, async (tx) => {
    const results = {
      succeeded: [],
      failed: [],
      summary: {
        total: payload.variants.length,
        successCount: 0,
        failureCount: 0,
      },
    };
    for (const [index, variant] of payload.variants.entries()) {
      try {
        if (variant.id) {
          console.log('found id');

          const [updated] = await tx
            .update(productVariants)
            .set({
              color: variant.color,
              size: variant.size,
              stock: variant.stock,
            })
            .where(
              and(
                eq(productVariants.id, variant.id),
                eq(productVariants.productId, Number(productId)),
                eq(productVariants.user_id, user.id)
              )
            )
            .returning();
          if (!updated) {
            throw new Error('Variant not found or access denied');
          }
        } else {
          console.log('no id found');
          const [created] = await tx
            .insert(productVariants)
            .values({
              productId: Number(productId),
              user_id: user.id,
              color: variant.color,
              size: variant.size,
              stock: variant.stock,
              sku: buildVariantSku({
                productSku: payload.productSKU,
                color: variant.color,
                size: variant.size,
              }),
            })
            .returning();

          results.created.push({
            index,
            variantId: created.id,
            variant: { color: variant.color, size: variant.size },
          });
        }

        results.succeeded.push({
          index,
          variantId: variant.id,
          variant: { color: variant.color, size: variant.size },
        });

        results.summary.successCount++;
      } catch (error) {
        results.failed.push({
          index,
          variantId: variant.id,
          variant: { color: variant.color, size: variant.size },
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        results.summary.failureCount++;
      }
    }
    console.log(results);
    return {
      success: results.failed.length === 0,
      data: results,
    };
  });
});
