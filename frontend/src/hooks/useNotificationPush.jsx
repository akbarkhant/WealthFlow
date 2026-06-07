import { useState, useEffect, useCallback } from 'react';

/**
 * Utility helper to convert a standard URL-safe Base64 VAPID public key
 * string into the specific Uint8Array buffer format required by the browser's 
 * PushManager subscription properties logic.
 * * @param {string} base64String 
 * @returns {Uint8Array}
 */
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const useNotificationPush = (apiServiceInstance) => {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hookError, setHookError] = useState(null);

    // 1. Structural Sanity Evaluation Checklist on Mounting
    useEffect(() => {
        const checkSystemSupport = () => {
            const hasServiceWorker = 'serviceWorker' in navigator;
            const hasPushManager = 'PushManager' in window;
            const hasNotification = 'Notification' in window;

            const supported = hasServiceWorker && hasPushManager && hasNotification;
            setIsSupported(supported);

            if (supported) {
                setPermission(Notification.permission);
                checkExistingSubscription();
            }
        };

        checkSystemSupport();
    }, []);

    /**
     * Evaluates if this browser instance already possesses an active push registration vector.
     */
    const checkExistingSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (err) {
            console.error('Failed to resolve current browser push status setup profiles:', err);
        }
    };

    /**
     * Action: Register browser details, acquire cryptographic coordinates tokens,
     * and sync state payloads cleanly up to the backend repositories.
     */
    const subscribeUser = useCallback(async () => {
        if (!isSupported) return;

        setIsProcessing(true);
        setHookError(null);

        try {
            // Step A: Request operating permission credentials frames explicitly
            const requestedPermission = await Notification.requestPermission();
            setPermission(requestedPermission);

            if (requestedPermission !== 'granted') {
                throw new Error('Push permission denied by user configuration settings.');
            }

            // Step B: Fetch VAPID authorization key string from backend
            // ── Change this block inside useNotificationPush.jsx ────────────────

            // Step B: Fetch VAPID authorization key string from backend
            const vapidKeyResponse = await apiServiceInstance.getVapidPublicKey();

            // Comprehensive extraction mapping both Axios (.data.publicKey) and Fetch (.publicKey) formats:
            const rawPublicKey = vapidKeyResponse?.data?.publicKey || vapidKeyResponse?.publicKey || vapidKeyResponse;

            if (!rawPublicKey || typeof rawPublicKey !== 'string') {
                throw new Error('Failed to acquire valid target validation public key string. Expected string format.');
            }

            // Step C: Execute structural target configurations registration bindings
            const convertedApplicationServerKey = urlBase64ToUint8Array(rawPublicKey);
            const registration = await navigator.serviceWorker.ready;

            const subscriptionPayload = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedApplicationServerKey,
            });

            // Step D: Transmit credentials maps securely to backend storage models
            await apiServiceInstance.saveSubscription(subscriptionPayload.toJSON());

            setIsSubscribed(true);
        } catch (err) {
            const cleanMessage = err.response?.data?.error || err.message || 'Push subscription processing failed.';
            setHookError(cleanMessage);
            console.error('Push Subscription Registration Interrupted:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [isSupported, apiServiceInstance]);

    /**
     * Action: Relinquish communication paths from the browser runtime engine
     * and clear database tracing elements off target service boundaries.
     */
    const unsubscribeUser = useCallback(async () => {
        if (!isSupported) return;

        setIsProcessing(true);
        setHookError(null);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Step A: Evict coordinates values structural mappings off remote server tables first
                const endpoint = subscription.endpoint;
                await apiServiceInstance.removeSubscription({ endpoint });

                // Step B: Dissolve the physical hardware registration keys link context locally
                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
        } catch (err) {
            const cleanMessage = err.response?.data?.error || err.message || 'Failed to clean subscription records.';
            setHookError(cleanMessage);
            console.error('Push Revocation Pipeline Error:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [isSupported, apiServiceInstance]);

    return {
        isSupported,
        permission,
        isSubscribed,
        isProcessing,
        error: hookError,
        subscribe: subscribeUser,
        unsubscribe: unsubscribeUser,
    };
};