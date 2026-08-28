import { Link } from 'react-router-dom';
import { ClipboardList, Package, BarChart2, Users } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <h1 className="font-heading text-3xl font-bold text-brand-choco-dark mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/orders"
          className="bg-brand-surface border border-brand-border rounded-md p-6 hover:shadow-md transition-shadow duration-200 animate-fade-up"
        >
          <ClipboardList size={32} className="mb-4" />
          <h2 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
            Orders
          </h2>
          <p className="text-brand-text-secondary text-sm">
            Manage and track all orders
          </p>
        </Link>

        <Link
          to="/admin/inventory"
          className="bg-brand-surface border border-brand-border rounded-md p-6 hover:shadow-md transition-shadow duration-200 animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          <Package size={32} className="mb-4" />
          <h2 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
            Inventory
          </h2>
          <p className="text-brand-text-secondary text-sm">
            Manage stock levels
          </p>
        </Link>

        <div className="bg-brand-surface border border-brand-border rounded-md p-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <BarChart2 size={32} className="mb-4" />
          <h2 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
            Analytics
          </h2>
          <p className="text-brand-text-secondary text-sm">
            View sales and performance
          </p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-md p-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Users size={32} className="mb-4" />
          <h2 className="font-heading text-xl font-semibold text-brand-choco-dark mb-2">
            Users
          </h2>
          <p className="text-brand-text-secondary text-sm">
            Manage customer accounts
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
