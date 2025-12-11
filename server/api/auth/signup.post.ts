import { subscriptions } from '~~/db/schema';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  user_id: z.uuid(),
  plan: z.enum(['gratis', 'emprendedor', 'negocio']).default('gratis'),
  status: z
    .enum(['active', 'inactive', 'cancelled', 'past_due'])
    .default('active'),
});

export default defineEventHandler(async (event) => {
  const db = useDB();
  const body = await readBody(event);
  const validated = createSubscriptionSchema.parse(body);

  try {
    const res = await db
      .insert(subscriptions)
      .values({
        user_id: validated.user_id,
        plan: validated.plan,
        status: validated.status,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: 0,
      })
      .returning();
    console.log(res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Datos inválidos',
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      message: 'Error al crear la suscripción',
    });
  }
});
