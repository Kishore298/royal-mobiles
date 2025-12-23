import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import {
  getCategories,
  getSubcategories,
  getProducts,
  getOrders,
} from '../../services/api';

const StatCard = ({ title, value, change, icon: Icon, isLoading }) => {
  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change !== undefined && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="ml-1">{Math.abs(change)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
    orders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch all required data in parallel
      const [
        categoriesRes,
        subcategoriesRes,
        productsRes,
        ordersRes
      ] = await Promise.all([
        getCategories({ limit: 1000 }), // Fetch all categories
        getSubcategories({ limit: 1000 }), // Fetch all subcategories
        getProducts({ limit: 1000 }), // Fetch all products
        getOrders({ limit: 5, sort: '-createdAt' }) // Get 5 most recent orders
      ]);

      // Set stats with proper error handling
      setStats({
        categories: categoriesRes?.data?.data?.length || 0,
        subcategories: subcategoriesRes?.data?.data?.length || 0,
        products: productsRes?.data?.data?.products?.length || 0,
        orders: ordersRes?.data?.data?.length || 0,
      });

      // Set recent orders with proper error handling
      if (ordersRes?.data?.data) {
        setRecentOrders(ordersRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your store's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Categories"
          value={stats.categories}
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Subcategories"
          value={stats.subcategories}
          icon={Boxes}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={ShoppingBag}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Orders
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No recent orders
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentOrders.map((order, index) => (
                    <li key={order._id}>
                      <div className="relative pb-8">
                        {index < recentOrders.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                              <ShoppingCart className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                New order received from{' '}
                                <span className="font-medium text-gray-900">
                                  {order.user?.name || 'Anonymous'}
                                </span>
                              </p>
                              <p className="text-sm text-gray-500">
                                Order total: ₹{order.totalPrice?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <div className="text-start md:text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={order.createdAt}>
                                {new Date(order.createdAt).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;