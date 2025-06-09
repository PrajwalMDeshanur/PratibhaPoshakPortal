// import { motion } from 'framer-motion';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Signup = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: formData.username,
//           email: formData.email,
//           password: formData.password
//         })
//       });

//       const data = await response.json();
//       if (response.ok) {
//         navigate('/login');
//       } else {
//         setError(data.message || 'Registration failed');
//       }
//     } catch (err) {
//       setError('Server error. Please try again later.');
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 px-4"
//     >
//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.2 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
//           <h2 className="text-3xl font-bold text-center text-white mb-8">Create Account</h2>
//           {error && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg mb-6"
//             >
//               {error}
//             </motion.div>
//           )}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-purple-300 mb-2" htmlFor="username">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-purple-300 mb-2" htmlFor="email">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-purple-300 mb-2" htmlFor="password">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-purple-300 mb-2" htmlFor="confirmPassword">
//                 Confirm Password
//               </label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
//                 required
//               />
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-2 font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
//             >
//               Sign Up
//             </motion.button>
//           </form>
//           <p className="text-center text-purple-300 mt-6">
//             Already have an account?{' '}
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               onClick={() => navigate('/login')}
//               className="text-blue-400 hover:text-blue-300 font-semibold"
//             >
//               Log In
//             </motion.button>
//           </p>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default Signup;