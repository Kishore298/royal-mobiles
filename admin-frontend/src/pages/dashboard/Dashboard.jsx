import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Boxes,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import {
  getCategories,
  getSubcategories,
  getProducts,
  getOrders,
} from '../../services/api';

const StatCard = ({ title, value, icon: Icon, isLoading, gradient, linkTo }) => {
  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link
        to={linkTo}
        className="block p-5 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/60 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:border-primary-400/50 dark:hover:border-emerald-500/40 transition-colors duration-200 group relative overflow-hidden"
      >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`} />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
              {value}
            </p>
          </div>
          <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${gradient} text-white shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs font-semibold text-primary-600 dark:text-emerald-400">
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
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

      const [categoriesRes, subcategoriesRes, productsRes, ordersRes] = await Promise.all([
        getCategories({ limit: 1000 }),
        getSubcategories({ limit: 1000 }),
        getProducts({ limit: 1000 }),
        getOrders({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      setStats({
        categories: categoriesRes?.data?.pagination?.total || categoriesRes?.data?.data?.length || 0,
        subcategories: subcategoriesRes?.data?.pagination?.total || subcategoriesRes?.data?.data?.length || 0,
        products: productsRes?.data?.data?.pagination?.total || productsRes?.data?.data?.products?.length || 0,
        orders: ordersRes?.data?.pagination?.total || ordersRes?.data?.data?.length || 0,
      });

      if (ordersRes?.data?.data) {
        setRecentOrders(ordersRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Royal Mobiles Management Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, Admin
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
              Track your live sales, fulfill customer orders, and manage inventory across all channels.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={ShoppingCart}
          isLoading={isLoading}
          gradient="from-emerald-500 to-green-600"
          linkTo="/orders"
        />
        <StatCard
          title="Active Products"
          value={stats.products}
          icon={Boxes}
          isLoading={isLoading}
          gradient="from-teal-500 to-emerald-600"
          linkTo="/products"
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={Package}
          isLoading={isLoading}
          gradient="from-blue-500 to-cyan-600"
          linkTo="/categories"
        />
        <StatCard
          title="Subcategories"
          value={stats.subcategories}
          icon={ShoppingBag}
          isLoading={isLoading}
          gradient="from-purple-500 to-indigo-600"
          linkTo="/subcategories"
        />
      </motion.div>

      {/* Recent Orders with Upfront Customer Info */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Latest fulfillment requests placed on the store.
            </p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-primary-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-16 bg-gray-100 dark:bg-[#16221b] rounded-xl animate-pulse" />
            <div className="h-16 bg-gray-100 dark:bg-[#16221b] rounded-xl animate-pulse" />
            <div className="h-16 bg-gray-100 dark:bg-[#16221b] rounded-xl animate-pulse" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
            No orders recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-emerald-950/40">
            {recentOrders.map((order) => {
              const name = order.user?.name || 'Customer';
              const phone = order.user?.phone || '';
              return (
                <div
                  key={order._id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-[#16221b]/40 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-emerald-950 text-primary-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>#{order._id.slice(-6).toUpperCase()}</span>
                        {phone && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        order.orderStatus === 'done'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-sm font-extrabold text-primary-600 dark:text-emerald-400">
                      ₹{Number(order.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;