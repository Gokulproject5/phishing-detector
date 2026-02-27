import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Loader = ({ message = "Synchronizing Neural Core..." }) => {
    return (
        <div className="fixed inset-0 bg-[#FDFDFF] flex flex-col items-center justify-center z-[9999]">
            <div className="relative">
                {/* Outer spin */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-t-2 border-indigo-600 rounded-full"
                />
                {/* Inner spin */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-b-2 border-emerald-500 rounded-full"
                />
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <Shield size={32} />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{message}</p>
                <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Loader;
