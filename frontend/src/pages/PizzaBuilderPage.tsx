import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { pizzaApi } from '../api/pizza.api';
import { orderApi } from '../api/order.api';
import {
  setStep,
  setBase,
  setSauce,
  setCheese,
  addVegetable,
  removeVegetable,
  clearCart,
  selectCartTotal,
} from '../features/cart/cartSlice';
import { Order, PizzaOption, PizzaOptions } from '../types';
import { getApiErrorMessage } from '../utils/errors';
import { parsePendingPizzaBuild } from '../utils/storage';
import { Sparkles, ShoppingBag, ArrowRight, ArrowLeft, RefreshCw, Check, Loader2, AlertCircle, X } from 'lucide-react';

// Paddle.js types
declare global {
  interface Window {
    Paddle: {
      Initialized?: boolean;
      Environment: {
        set: (env: 'sandbox' | 'production') => void;
      };
      Initialize: (options: { token: string; eventCallback?: (data: PaddleEvent) => void }) => void;
      Checkout: {
        open: (options: {
          transactionId: string;
          customer?: {
            email: string;
            name: string;
          };
          settings?: {
            displayMode?: 'overlay' | 'inline';
            theme?: 'light' | 'dark';
            variant?: 'one-page' | 'multi-page' | 'express';
          };
          successUrl?: string;
        }) => void;
        close: () => void;
      };
      Event: {
        addListener: (event: string, callback: (data: PaddleEvent) => void) => void;
        removeListener: (event: string, callback: (data: PaddleEvent) => void) => void;
      };
    };
  }
}

interface PaddleEvent {
  name?: string;
  detail?: string;
  data?: { id?: string; transaction_id?: string };
  transaction_id?: string;
  checkout_completed?: boolean;
}

const PLACEHOLDER = 'https://placehold.co/400x300/FDE8D4/6B3520?text=Ingredient';
let paddleInitialized = false;

const PizzaBuilderPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { base, sauce, cheese, vegetables, currentStep } = useAppSelector((state) => state.cart);
  const total = useAppSelector(selectCartTotal);

  const [options, setOptions] = useState<PizzaOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutHandledRef = useRef(false);
  const paddleReadyRef = useRef<Promise<void> | null>(null);

  // Refs for auto-centering active step on mobile
  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setLoading(true);
    pizzaApi
      .getPizzaOptions()
      .then((response) => {
        setOptions(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [dispatch]);

  // Initialize Paddle.js
  useEffect(() => {
    const paddleEnvironment = import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox';
    const paddleToken = paddleEnvironment === 'sandbox' 
      ? import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN 
      : import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN;

    if (!paddleToken) {
      setErrorMessage('Paddle client token is missing. Check the VITE_PADDLE_*_CLIENT_TOKEN setting.');
      return;
    }

    const pollForOrder = async (transactionId: string, txRef: string) => {
      const startedAt = Date.now();
      const deadline = startedAt + 20000;
      let initialOrderCount: number | null = null;

      while (Date.now() < deadline) {
        try {
          const response = await orderApi.getMyOrders();
          initialOrderCount ??= response.data.length;
          const matchingOrder = response.data.find((order: Order) => (
            order.paymentId === transactionId ||
            order.txRef === txRef
          ));

          if (matchingOrder && response.data.length >= initialOrderCount) {
            dispatch(clearCart());
            localStorage.removeItem('pendingPizzaBuild');
            setCheckoutLoading(false);
            setCheckoutSuccess(false);
            navigate(`/orders/${matchingOrder._id}`, { replace: true });
            return;
          }
        } catch (error) {
          console.error('Polling for order failed:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setCheckoutLoading(false);
      setCheckoutSuccess(false);
      navigate('/orders', { replace: true });
    };

    const handleCheckoutComplete = (data: PaddleEvent) => {
      console.log('Paddle checkout completed:', data);
      if (checkoutHandledRef.current) return;
      checkoutHandledRef.current = true;
      setCheckoutLoading(true);
      setCheckoutSuccess(true);

      const savedBuildStr = localStorage.getItem('pendingPizzaBuild');
      if (savedBuildStr) {
        try {
          const savedBuild = parsePendingPizzaBuild(savedBuildStr);
          const transactionId = data?.data?.transaction_id || data?.transaction_id || savedBuild.transactionId;
          const txRef = savedBuild.txRef;

          orderApi.verifyPayment({
            transactionId,
          })
            .then(() => {
              if (transactionId && txRef) {
                void pollForOrder(transactionId, txRef);
              }
            })
            .catch((err) => {
              if (err.response?.status === 202) {
                const transactionId = data?.data?.transaction_id || data?.transaction_id || savedBuild.transactionId;
                const txRef = savedBuild.txRef;
                if (transactionId && txRef) {
                  void pollForOrder(transactionId, txRef);
                  return;
                }
              }

              setCheckoutLoading(false);
              setCheckoutSuccess(false);
              setErrorMessage(err.response?.data?.message || 'Payment verification failed. Please contact customer support.');
            });
        } catch (e) {
          setCheckoutLoading(false);
          setCheckoutSuccess(false);
          setErrorMessage('Could not load order details. Please contact customer support.');
        }
      } else {
        setCheckoutLoading(false);
        setCheckoutSuccess(false);
        navigate('/orders', { replace: true });
      }
    };

    const handlePaddleEvent = (data: PaddleEvent) => {
      if (data?.name === 'checkout.completed') {
        handleCheckoutComplete(data);
        return;
      }

      if (data?.name === 'checkout.error') {
        console.error('Paddle checkout error:', data.detail || data);
        setCheckoutLoading(false);
        setCheckoutSuccess(false);
        setErrorMessage(data.detail || 'Paddle could not open checkout. Please try again.');
      }
    };

    const handleCheckoutClose = (data: PaddleEvent) => {
      console.log('Paddle checkout closed:', data);
      if (data && !data.checkout_completed) {
        setErrorMessage('Payment was cancelled. You can try checkout again.');
      }
      setCheckoutLoading(false);
    };

    const registerPaddleListeners = () => {
      if (!window.Paddle || !window.Paddle.Event) return;

      window.Paddle.Event.addListener('checkout.closed', handleCheckoutClose);
      console.log('Paddle event listeners registered');
    };

    paddleReadyRef.current = new Promise<void>((resolve, reject) => {
      const initialize = () => {
        if (!window.Paddle) {
          reject(new Error('Paddle.js did not load'));
          return;
        }

        window.Paddle.Environment.set(paddleEnvironment as 'sandbox' | 'production');
        if (!window.Paddle.Initialized && !paddleInitialized) {
          window.Paddle.Initialize({ token: paddleToken, eventCallback: handlePaddleEvent });
          paddleInitialized = true;
        }
        registerPaddleListeners();
        console.log('Paddle.js initialized');
        resolve();
      };

      if (window.Paddle) {
        initialize();
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', initialize, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Paddle.js did not load')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = initialize;
      script.onerror = () => reject(new Error('Paddle.js did not load'));
      document.body.appendChild(script);
    });

    return () => {
      if (window.Paddle && window.Paddle.Event) {
        window.Paddle.Event.removeListener('checkout.closed', handleCheckoutClose);
      }
    };
  }, [dispatch, navigate]);

  // Handle return callback from Paddle checkout (if using redirect)
  useEffect(() => {
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    if (status === 'completed' && transactionId) {
      setCheckoutLoading(true);
      const savedBuildStr = localStorage.getItem('pendingPizzaBuild');
      
      if (savedBuildStr) {
        try {
          parsePendingPizzaBuild(savedBuildStr);
          
          orderApi.verifyPayment({
            transactionId,
          })
          .then(() => {
            setCheckoutLoading(false);
            dispatch(clearCart());
            localStorage.removeItem('pendingPizzaBuild');
            navigate('/orders');
          })
          .catch((err) => {
            setCheckoutLoading(false);
            setErrorMessage(err.response?.data?.message || 'Payment verification failed. Please contact customer support.');
          });
        } catch (e) {
          setCheckoutLoading(false);
          setErrorMessage('Could not load order details. Please contact customer support.');
        }
      } else {
        setCheckoutLoading(false);
        setErrorMessage('No pending pizza configuration details found.');
      }
      
      // Clear URL params to avoid re-triggering on page refresh
      setSearchParams({}, { replace: true });
    } else if (status === 'cancelled') {
      setErrorMessage('Payment was cancelled. You can try checkout again.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, dispatch, navigate]);

  // Scroll active step into center on mobile
  useEffect(() => {
    const container = scrollRef.current;
    const activeStep = stepRefs.current[currentStep];
    if (!container || !activeStep) return;

    const containerWidth = container.offsetWidth;
    const stepLeft = activeStep.offsetLeft;
    const stepWidth = activeStep.offsetWidth;
    const scrollTarget = stepLeft - containerWidth / 2 + stepWidth / 2;

    container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [currentStep]);

  const steps = [
    { title: 'Choose Base', description: 'Select your pizza crust' },
    { title: 'Add Sauce', description: 'Pick your favorite sauce' },
    { title: 'Add Cheese', description: 'Choose your cheese' },
    { title: 'Add Toppings', description: 'Select your vegetables' },
  ];

  const handleOptionSelect = (option: PizzaOption) => {
    if (!option.inStock) return;
    
    if (currentStep === 0) dispatch(setBase(option));
    else if (currentStep === 1) dispatch(setSauce(option));
    else if (currentStep === 2) dispatch(setCheese(option));
  };

  const handleToppingToggle = (option: PizzaOption) => {
    if (!option.inStock) return;
    
    const isSelected = vegetables.some((v) => v.name === option.name);
    if (isSelected) {
      dispatch(removeVegetable(option.name));
    } else {
      dispatch(addVegetable(option));
    }
  };

  const getStepOptions = (): PizzaOption[] => {
    if (!options) return [];
    if (currentStep === 0) return options.bases;
    if (currentStep === 1) return options.sauces;
    if (currentStep === 2) return options.cheeses;
    return options.vegetables;
  };

  const isOptionSelected = (option: PizzaOption): boolean => {
    if (currentStep === 0) return base?.name === option.name;
    if (currentStep === 1) return sauce?.name === option.name;
    if (currentStep === 2) return cheese?.name === option.name;
    return vegetables.some((v) => v.name === option.name);
  };

  const isCurrentStepValid = (): boolean => {
    if (currentStep === 0) return !!base;
    if (currentStep === 1) return !!sauce;
    if (currentStep === 2) return !!cheese;
    return true; // Toppings are optional
  };

  const handleCheckout = async () => {
    if (!isCurrentStepValid() || !base || !sauce || !cheese) return;

    try {
      setCheckoutLoading(true);
      setErrorMessage(null);
      checkoutHandledRef.current = false;

      await paddleReadyRef.current;

      const pizzaItem = {
        base: base.name,
        sauce: sauce.name,
        cheese: cheese.name,
        vegetables: vegetables.map((v) => v.name),
        quantity: 1,
      };

      const orderPayload = {
        items: [pizzaItem],
        totalPrice: total,
      };

      // Create Paddle transaction from backend
      const response = await orderApi.initializePayment(orderPayload);
      
      // Save custom build details with txRef and transactionId to restore after payment callback
      localStorage.setItem('pendingPizzaBuild', JSON.stringify({
        ...orderPayload,
        txRef: response.data.txRef,
        transactionId: response.data.transactionId,
      }));

      // Open Paddle Checkout with the transaction ID
      if (window.Paddle && window.Paddle.Checkout) {
        window.Paddle.Checkout.open({
          transactionId: response.data.transactionId,
          customer: {
            email: 'customer@example.com',
            name: 'Customer',
          },
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            variant: 'multi-page',
          },
          successUrl: `${window.location.origin}/orders?status=completed&transaction_id=${response.data.transactionId}`,
        });
        setCheckoutLoading(false);
      } else {
        setCheckoutLoading(false);
        setErrorMessage('Paddle.js not loaded. Please refresh the page and try again.');
      }
    } catch (err: unknown) {
      setCheckoutLoading(false);
      setErrorMessage(getApiErrorMessage(err, 'Failed to initialize checkout. Please try again.'));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in relative">
      
      {/* Premium Loader Overlay for Redirect Verification */}
      {checkoutLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
          <p className="text-lg font-semibold tracking-wide">
            {checkoutSuccess ? 'Payment successful! Finalizing your order...' : 'Processing Secure Payment Callback...'}
          </p>
          <p className="text-xs text-brand-text-placeholder mt-2">Do not refresh or close this window.</p>
        </div>
      )}

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 animate-shake relative">
          <AlertCircle className="shrink-0 text-red-600 mt-0.5" size={18} />
          <div className="flex-1 text-sm font-medium">
            {errorMessage}
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-choco-dark flex items-center gap-2">
            <Sparkles className="text-brand-orange" />
            Build Your Custom Pizza
          </h1>
          <p className="text-brand-text-secondary text-sm mt-1">
            Pick your ingredients fresh from the store to design your culinary masterpiece.
          </p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="self-start text-xs font-semibold text-brand-choco hover:text-brand-orange transition-colors flex items-center gap-1 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-sm"
        >
          <RefreshCw size={12} />
          Reset Build
        </button>
      </div>

      {/* Progress Steps — hidden scrollbar, auto-centered */}
      <div className="mb-8 bg-brand-surface-elevated border border-brand-border rounded-lg p-4 shadow-sm">
        <div
          ref={scrollRef}
          className="overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex items-center min-w-max md:min-w-0 md:justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => { stepRefs.current[index] = el; }}
                className="flex items-center shrink-0 md:flex-1"
              >
                {/* Step circle + label */}
                <button
                  onClick={() => dispatch(setStep(index))}
                  className="flex items-center text-left focus:outline-none"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      index === currentStep
                        ? 'border-brand-orange bg-brand-orange text-white shadow-md shadow-brand-orange/30 scale-105'
                        : index < currentStep
                        ? 'border-brand-choco bg-brand-choco text-white'
                        : 'border-brand-border bg-brand-surface text-brand-text-muted'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check size={18} strokeWidth={2.5} />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 whitespace-nowrap mr-4">
                    <p className={`text-sm font-semibold ${index <= currentStep ? 'text-brand-choco-dark' : 'text-brand-text-muted'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-brand-text-muted">{step.description}</p>
                  </div>
                </button>

                {/* Connector line between steps */}
                {index < steps.length - 1 && (
                  <div
                    className="w-10 md:flex-1 h-0.5 mx-2 shrink-0 transition-colors duration-300"
                    style={{ background: index < currentStep ? '#6B3520' : '#E8E2D9' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Card Ingredients selection + Order details Sidebar */}
      {loading ? (
        <div className="text-center py-20 bg-brand-surface rounded-lg border border-brand-border">
          <div className="animate-pulse-soft text-brand-text-muted">Loading fresh ingredients...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ingredients list cards (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-surface-elevated border border-brand-border rounded-lg p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-brand-choco-dark mb-6 border-b border-brand-border pb-3">
                {steps[currentStep].title} options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {getStepOptions().map((option) => {
                  const selected = isOptionSelected(option);
                  const isToppingStep = currentStep === 3;

                  return (
                    <div
                      key={option.name}
                      onClick={() =>
                        isToppingStep ? handleToppingToggle(option) : handleOptionSelect(option)
                      }
                      className={`relative rounded-lg overflow-hidden border bg-white shadow-sm cursor-pointer transition-all duration-300 flex flex-col group ${
                        !option.inStock
                          ? 'opacity-60 cursor-not-allowed border-brand-border'
                          : selected
                          ? 'border-brand-orange ring-2 ring-brand-orange/20 scale-[1.01]'
                          : 'border-brand-border hover:border-brand-orange-light hover:shadow-md'
                      }`}
                    >
                      {/* Image header with pricing tag */}
                      <div className="relative h-44 w-full bg-brand-orange-pale/30 overflow-hidden shrink-0">
                        <img
                          src={option.imageUrl || PLACEHOLDER}
                          alt={option.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER;
                          }}
                        />
                        
                        {/* Price Badge */}
                        <div className="absolute top-3 right-3 bg-brand-choco-dark/85 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide">
                          +${option.price.toFixed(2)}
                        </div>

                        {/* Out of Stock Overlay */}
                        {!option.inStock && (
                          <div className="absolute inset-0 bg-brand-choco-dark/70 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-white text-xs font-bold uppercase tracking-wider bg-red-600 px-3 py-1 rounded-sm">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Selection Checkmark Overlay */}
                        {selected && option.inStock && (
                          <div className="absolute top-3 left-3 bg-brand-orange text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-scale-in">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Info body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-heading text-base font-bold text-brand-choco-dark">
                            {option.name}
                          </h3>
                          <p className="text-xs text-brand-text-muted mt-0.5">
                            {option.inStock ? 'Fresh & in-store' : 'Currently unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => dispatch(setStep(Math.max(currentStep - 1, 0)))}
                disabled={currentStep === 0}
                className="border border-brand-choco text-brand-choco px-6 py-2.5 rounded-sm text-sm font-semibold hover:bg-brand-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => dispatch(setStep(currentStep + 1))}
                  disabled={!isCurrentStepValid()}
                  className="bg-brand-orange text-white px-6 py-2.5 rounded-sm text-sm font-semibold hover:bg-brand-orange-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  Next Step
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={!isCurrentStepValid() || checkoutLoading}
                  className="bg-brand-choco text-white px-6 py-2.5 rounded-sm text-sm font-semibold hover:bg-brand-choco-mid transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-brand-choco/20"
                >
                  {checkoutLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShoppingBag size={16} />
                  )}
                  Checkout Pizza
                </button>
              )}
            </div>
          </div>

          {/* Builder summary details (Right Column) */}
          <div className="space-y-6">
            <div className="bg-brand-surface-elevated border border-brand-border rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="font-heading text-lg font-bold text-brand-choco-dark mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                <ShoppingBag className="text-brand-orange" size={20} />
                Your Pizza Summary
              </h2>

              <div className="space-y-4 mb-6">
                {/* Base */}
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-semibold text-brand-text-primary">Base Crust</p>
                    <p className="text-xs text-brand-text-muted">{base ? base.name : 'Not selected'}</p>
                  </div>
                  <span className="font-mono text-brand-choco-dark font-medium">
                    {base ? `$${base.price.toFixed(2)}` : '--'}
                  </span>
                </div>

                {/* Sauce */}
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-semibold text-brand-text-primary">Sauce</p>
                    <p className="text-xs text-brand-text-muted">{sauce ? sauce.name : 'Not selected'}</p>
                  </div>
                  <span className="font-mono text-brand-choco-dark font-medium">
                    {sauce ? `$${sauce.price.toFixed(2)}` : '--'}
                  </span>
                </div>

                {/* Cheese */}
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-semibold text-brand-text-primary">Cheese</p>
                    <p className="text-xs text-brand-text-muted">{cheese ? cheese.name : 'Not selected'}</p>
                  </div>
                  <span className="font-mono text-brand-choco-dark font-medium">
                    {cheese ? `$${cheese.price.toFixed(2)}` : '--'}
                  </span>
                </div>

                {/* Toppings (Vegetables) */}
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-semibold text-brand-text-primary">Toppings</p>
                    <p className="text-xs text-brand-text-muted">
                      {vegetables.length > 0
                        ? vegetables.map((v) => v.name).join(', ')
                        : 'No toppings selected'}
                    </p>
                  </div>
                  <span className="font-mono text-brand-choco-dark font-medium">
                    {vegetables.length > 0
                      ? `$${vegetables.reduce((sum, v) => sum + v.price, 0).toFixed(2)}`
                      : '--'}
                  </span>
                </div>
              </div>

              {/* Total Summary Footer */}
              <div className="border-t-2 border-dashed border-brand-border pt-4 flex justify-between items-center mb-6">
                <span className="font-heading text-lg font-bold text-brand-choco-dark">Total Price</span>
                <span className="font-mono text-2xl font-black text-brand-orange">${total.toFixed(2)}</span>
              </div>

              <div className="text-xs text-brand-text-muted leading-relaxed bg-brand-surface rounded p-3 border border-brand-border/60">
                💡 Fill in all base selections (Crust, Sauce, and Cheese) to unlock checkout and add your customized pizza to order items.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PizzaBuilderPage;
