// composables/useSubscription.ts
import type { Subscription } from '~~/db/schema';

export const useUserSubscription = () => {
  const subscription = useState<Subscription | null>(
    'user-subscription',
    () => null
  );
  console.log('klajsdlkasjdl', subscription.value);
  const loading = useState('subscription-loading', () => true);

  // Plan limits configuration
  const planLimits = {
    gratis: {
      maxProducts: 100,
      maxSales: 50, // per month
      maxImages: 0,
      historyDays: 7,
      features: {
        analytics: false,
        advancedAnalytics: false,
        lowStockAlerts: false,
        exportExcel: false,
        bulkOperations: false,
        multiUser: false,
      },
    },
    emprendedor: {
      maxProducts: 500,
      maxSales: Infinity,
      maxImages: 50,
      historyDays: 90,
      features: {
        analytics: true,
        advancedAnalytics: false,
        lowStockAlerts: false,
        exportExcel: false,
        bulkOperations: false,
        multiUser: false,
      },
    },
    negocio: {
      maxProducts: Infinity,
      maxSales: Infinity,
      maxImages: 200,
      historyDays: Infinity,
      features: {
        analytics: true,
        advancedAnalytics: true,
        lowStockAlerts: true,
        exportExcel: true,
        bulkOperations: true,
        multiUser: false, // Add later
      },
    },
  };

  // Fetch subscription from server
  const fetchSubscription = async () => {
    loading.value = true;
    try {
      const { data } = await useFetch('/api/wompi/subscriptions/current');
      subscription.value = data.value;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      subscription.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Get current plan (defaults to gratis if no subscription)
  const currentPlan = computed(() => {
    if (!subscription.value) return 'gratis';
    if (subscription.value.status !== 'active') return 'gratis';
    return subscription.value.plan as 'gratis' | 'emprendedor' | 'negocio';
  });

  // Check if subscription is active
  const isActive = computed(() => {
    if (!subscription.value) return false;
    if (subscription.value.status !== 'active') return false;

    const now = new Date();
    const periodEnd = new Date(subscription.value.current_period_end);
    return periodEnd > now;
  });

  // Get plan limits
  const limits = computed(() => planLimits[currentPlan.value]);

  // Check if user can perform action based on current count
  const canCreate = (
    type: 'product' | 'sale' | 'image',
    currentCount: number
  ) => {
    const limit =
      type === 'product'
        ? limits.value.maxProducts
        : type === 'sale'
          ? limits.value.maxSales
          : limits.value.maxImages;

    return currentCount < limit;
  };

  // Check if feature is available
  const hasFeature = (feature: keyof typeof planLimits.gratis.features) => {
    return limits.value.features[feature];
  };

  // Get days until subscription expires
  const daysUntilExpiry = computed(() => {
    if (!subscription.value?.current_period_end) return null;

    const now = new Date();
    const end = new Date(subscription.value.current_period_end);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  // Check if subscription needs renewal soon
  const needsRenewal = computed(() => {
    const days = daysUntilExpiry.value;
    return days !== null && days <= 7 && days > 0;
  });

  // Check if subscription is expired
  const isExpired = computed(() => {
    const days = daysUntilExpiry.value;
    return days !== null && days <= 0;
  });

  // Get user-friendly plan name
  const planName = computed(() => {
    const names = {
      gratis: 'Plan Gratis',
      emprendedor: 'Plan Emprendedor',
      negocio: 'Plan Negocio',
    };
    return names[currentPlan.value];
  });

  // Initialize on first use
  if (subscription.value === null) {
    console.log('Fetching subscription');
    fetchSubscription();
  }

  return {
    subscription,
    loading,
    currentPlan,
    planName,
    isActive,
    isExpired,
    needsRenewal,
    daysUntilExpiry,
    limits,
    canCreate,
    hasFeature,
    fetchSubscription,
    refresh: fetchSubscription,
  };
};
