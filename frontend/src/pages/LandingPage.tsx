import { Link } from 'react-router-dom';
import { Pizza, Clock, Truck } from 'lucide-react';
import welcomeIMG from "../img/welcomeIMG.png";
import { useAppSelector } from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="animate-fade-in">
      <section className="bg-brand-cream py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center animate-slide-in-left">
              <h1 className="font-heading text-4xl font-bold text-brand-choco-dark md:text-5xl lg:text-6xl animate-scale-in">
                Fresh Artisan Pizza
                <br />
                <span className="text-brand-orange">Delivered Hot</span>
              </h1>
              <p className="mt-6 text-lg text-brand-text-secondary animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Build your perfect pizza with our premium ingredients. From hand-tossed dough to fresh toppings, every bite is a masterpiece.
              </p>
              <div className="mt-8 flex space-x-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                {isAuthenticated ? (
                  <Link
                    to="/menu"
                    className="bg-brand-orange text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-brand-orange-light hover:scale-105 transition-all duration-200"
                  >
                    Order something -&gt;
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-brand-orange text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-brand-orange-light hover:scale-105 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="border border-brand-choco text-brand-choco px-6 py-3 rounded-sm text-sm font-medium hover:bg-brand-cream hover:scale-105 transition-all duration-200"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <img src={welcomeIMG} alt="Welcome" className="hover:scale-105 transition-transform duration-500 ease-out" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="font-heading text-3xl font-bold text-brand-choco-dark text-center animate-fade-up">
            Why Choose DailyPizza?
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-brand-surface border border-brand-border rounded-md p-6 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <Clock size={32} className="mb-4 hover:scale-110 transition-transform duration-300" />
              <h3 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
                Fast Delivery
              </h3>
              <p className="text-brand-text-secondary">
                Hot pizza delivered to your door in 30 minutes or less.
              </p>
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-md p-6 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Pizza size={32} className="mb-4 hover:scale-110 transition-transform duration-300" />
              <h3 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
                Custom Builder
              </h3>
              <p className="text-brand-text-secondary">
                Create your perfect pizza with our easy-to-use builder.
              </p>
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-md p-6 hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Truck size={32} className="mb-4 hover:scale-110 transition-transform duration-300" />
              <h3 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
                Real-Time Tracking
              </h3>
              <p className="text-brand-text-secondary">
                Track your order from kitchen to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
