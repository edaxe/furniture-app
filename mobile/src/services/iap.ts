import { Platform } from 'react-native';
import {
  setup,
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type Purchase,
  type PurchaseError,
  type Subscription,
} from 'react-native-iap';
import { useAuthStore } from '../store/authStore';

const PRODUCT_ID = 'com.furnishsnap.app.premium.monthly';
const subscriptionSkus = [PRODUCT_ID];

let purchaseUpdateSubscription: ReturnType<typeof purchaseUpdatedListener> | null = null;
let purchaseErrorSubscription: ReturnType<typeof purchaseErrorListener> | null = null;

export async function setupIAP(): Promise<void> {
  try {
    setup({ storekitMode: 'STOREKIT2_MODE' });
    await initConnection();
    setupListeners();
  } catch (error) {
    console.warn('IAP connection failed:', error);
  }
}

function setupListeners(): void {
  purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: Purchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        useAuthStore.getState().setSubscription('premium');
        await finishTransaction({ purchase, isConsumable: false });
      }
    }
  );

  purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
    console.warn('IAP purchase error:', error);
  });
}

export async function fetchSubscription(): Promise<Subscription | null> {
  try {
    const subscriptions = await getSubscriptions({ skus: subscriptionSkus });
    return subscriptions.length > 0 ? subscriptions[0] : null;
  } catch (error) {
    console.warn('Failed to fetch subscriptions:', error);
    return null;
  }
}

export async function purchaseSubscription(): Promise<void> {
  if (Platform.OS === 'ios') {
    await requestSubscription({ sku: PRODUCT_ID });
  } else {
    await requestSubscription({
      subscriptionOffers: [{ sku: PRODUCT_ID, offerToken: '' }],
    });
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const hasActiveSubscription = purchases.some(
      (purchase) => purchase.productId === PRODUCT_ID
    );
    if (hasActiveSubscription) {
      useAuthStore.getState().setSubscription('premium');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to restore purchases:', error);
    throw error;
  }
}

export async function checkSubscriptionStatus(): Promise<void> {
  try {
    const purchases = await getAvailablePurchases();
    const hasActiveSubscription = purchases.some(
      (purchase) => purchase.productId === PRODUCT_ID
    );
    if (hasActiveSubscription) {
      useAuthStore.getState().setSubscription('premium');
    }
  } catch (error) {
    console.warn('Failed to check subscription status:', error);
  }
}

export function teardownIAP(): void {
  purchaseUpdateSubscription?.remove();
  purchaseErrorSubscription?.remove();
  purchaseUpdateSubscription = null;
  purchaseErrorSubscription = null;
  endConnection();
}
