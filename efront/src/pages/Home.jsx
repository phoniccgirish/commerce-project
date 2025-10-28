import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const featuredCategories = [
    {
      name: "Electronics",
      link: "/shop?category=electronics",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Books",
      link: "/shop?category=books",
      img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Clothing",
      link: "/shop?category=clothing",
      img: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1035",
    },
    {
      name: "Home Goods",
      link: "/shop?category=home",
      img: "https://images.unsplash.com/photo-1741992556911-f04553890e36?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2069",
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className='relative text-center py-24 px-6 overflow-hidden'
      >
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 opacity-95'></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20"></div>

        <div className='relative z-10 text-white max-w-3xl mx-auto'>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className='text-5xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-pink-400'
          >
            Welcome to Exoticc Store
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='text-gray-100 text-lg mb-8 leading-relaxed'
          >
            Your one-stop shop for unique and high-quality products. Explore
            your next favorite collection today!
          </motion.p>

          <Link
            to='/shop'
            className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-pink-600 px-8 py-3 rounded-full text-white font-semibold shadow-md hover:shadow-xl transition-all'
          >
            Shop Now
          </Link>
        </div>
      </motion.section>

      {/* Featured Categories Section */}
      <section className='py-20 px-6'>
        <h2 className='text-3xl font-bold text-center text-slate-900 mb-12'>
          Featured Categories
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto'>
          {featuredCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-200 transition-all'
            >
              <Link to={category.link}>
                <div className='relative'>
                  <img
                    src={category.img}
                    alt={category.name}
                    className='h-48 w-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
                </div>
                <div className='p-4 text-center'>
                  <h3 className='text-lg font-semibold text-slate-800'>
                    {category.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-gray-300 py-10 text-center'>
        <p className='text-sm'>
          © {new Date().getFullYear()}{" "}
          <span className='text-indigo-400 font-semibold'>Exoticc</span>. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
