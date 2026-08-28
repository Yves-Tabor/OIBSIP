import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { pizzaApi } from '../api/pizza.api';
import { setStep, clearCart } from '../features/cart/cartSlice';

const PizzaBuilderPage = () => {
  const dispatch = useAppDispatch();
  const { base, sauce, cheese, vegetables, currentStep } = useAppSelector((state) => state.cart);

  useEffect(() => {
    // Load pizza options on mount
    pizzaApi.getPizzaOptions().then((response) => {
      console.log('Pizza options:', response.data);
    });
  }, [dispatch]);

  const steps = [
    { title: 'Choose Base', description: 'Select your pizza crust' },
    { title: 'Add Sauce', description: 'Pick your favorite sauce' },
    { title: 'Add Cheese', description: 'Choose your cheese' },
    { title: 'Add Toppings', description: 'Select your vegetables' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <h1 className="font-heading text-3xl font-bold text-brand-choco-dark mb-8">
        Build Your Pizza
      </h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'border-brand-orange bg-brand-orange text-white'
                    : 'border-brand-border text-brand-text-muted'
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-3">
                <p className={`font-medium ${index <= currentStep ? 'text-brand-choco-dark' : 'text-brand-text-muted'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-brand-text-muted">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-brand-border mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pizza Builder Content */}
      <div className="bg-brand-surface border border-brand-border rounded-md p-8">
        <p className="text-brand-text-secondary text-center py-12">
          Pizza builder content will be implemented here.
          <br />
          Current step: {currentStep}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch(setStep(Math.max(currentStep - 1, 0)))}
          disabled={currentStep === 0}
          className="border border-brand-choco text-brand-choco px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-cream transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => dispatch(setStep(Math.min(currentStep + 1, 3)))}
          disabled={currentStep === 3}
          className="bg-brand-orange text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PizzaBuilderPage;
