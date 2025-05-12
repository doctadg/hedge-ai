"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import React from "react";

export function HeroSection() {
  // Scroll parallax for background elements
  const { scrollYProgress } = useScroll();
  // Slower parallax for radial gradients
  const yRadialGradients = useTransform(scrollYProgress, [0, 1], [0, -100]);
  // Faster parallax for grid, but still slower than content
  const yGrid = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // Scroll-based fade out for hero content
  const opacityPill = useTransform(scrollYProgress, [0.02, 0.08], [1, 0]);
  const yPill = useTransform(scrollYProgress, [0.02, 0.08], [0, -20]);

  const opacityHeading = useTransform(scrollYProgress, [0.04, 0.10], [1, 0]);
  const yHeading = useTransform(scrollYProgress, [0.04, 0.10], [0, -20]);

  const opacityParagraph = useTransform(scrollYProgress, [0.06, 0.12], [1, 0]);
  const yParagraph = useTransform(scrollYProgress, [0.06, 0.12], [0, -20]);

  const opacityButton = useTransform(scrollYProgress, [0.08, 0.14], [1, 0]);
  const yButton = useTransform(scrollYProgress, [0.08, 0.14], [0, -20]);

  // Scroll-based fade out for image
  const opacityImage = useTransform(scrollYProgress, [0.1, 0.2], [1, 0]);
  // const yImage = useTransform(scrollYProgress, [0, 0.25], [0, -50]); // This constant is no longer used

  // Removed mouseX, mouseY, rotateX, rotateY, handleMouseMove, handleMouseLeave for 3D tilt effect

  return (
    <section className="relative min-h-screen overflow-hidden bg-black pt-16">
      {" "}
      {/* Added pt-16 for navbar space */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          {/* Removed the old gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />

          {/* Subtle radial gradient with animation */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 100%, rgba(188, 234, 57, 0.1), transparent 50%),
                           radial-gradient(circle at 20% 90%, rgba(141, 200, 5, 0.1), transparent 40%),
                           radial-gradient(circle at 80% 90%, rgba(89, 133, 5, 0.1), transparent 40%)`,
              animation: "pulse 7s ease-in-out infinite",
              y: yRadialGradients, // Apply parallax effect
            }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #1a1a1a 1px, transparent 1px),
                               linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)`,
              backgroundSize: "4rem 4rem",
              maskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
              y: yGrid, // Apply parallax effect
            }}
          />
        </div>
      </div>
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex min-h-screen flex-col items-center justify-center text-center">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8 inline-flex items-center rounded-full border border-gray-800 bg-gray-900/50 px-6 py-2 backdrop-blur"
                style={{ opacity: opacityPill, y: yPill }}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-300">AI-Powered Alpha Generation</span>
              </motion.div>

              {/* Text gradient */}
              <motion.h1
                variants={{
                  hidden: { opacity: 1 }, 
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.4, 
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                className="mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ opacity: opacityHeading, y: yHeading }}
              >
                {"Hedge AI".split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          damping: 12,
                          stiffness: 100,
                        },
                      },
                    }}
                    style={{ display: "inline-block", marginRight: "0.25em" }} 
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }} 
                className="mb-10 text-lg text-gray-300 sm:text-xl md:text-2xl"
                style={{ opacity: opacityParagraph, y: yParagraph }}
              >
                Next-Generation Investment Intelligence.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 1.0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                style={{ opacity: opacityButton, y: yButton }}
              >
                <Button
                  asChild
                  size="lg"
                  className="relative h-16 overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-10 py-4 text-xl font-semibold text-white transition-all duration-300 ease-in-out hover:shadow-[0_0_50px_5px_rgba(34,197,94,0.4)] focus:shadow-[0_0_50px_5px_rgba(34,197,94,0.4)]"
                >
                  <Link href="/dashboard">
                    Get Started
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite] transition-all" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            {/* Dashboard preview with modern animated border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="relative mt-16 group"
            >
              {/* Container with border - Restored border lights - Removed p-1 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800/50">
                {/* Border Light 1 (Line Snake) - Added z-20 and reversed gradient */}
                <div className="absolute top-1 left-1 w-full h-full pointer-events-none rounded-xl z-20">
                  {/* Added overflow-hidden and rounded-xl */}
                  <div
                    className="absolute w-1 h-1 bg-gradient-to-r from-green-500 via-green-400 to-transparent rounded-full animate-border-light-1 shadow-[0_0_10px_2px_rgba(34,197,94,0.7)]" // Changed w-1/4 to w-1/2
                    style={{ transformOrigin: '0 0' }} // Set transform origin for proper rotation/movement
                  ></div>
                </div>

                {/* Border Light 2 (Line Snake) - Added z-20 and reversed gradient */}
                <div className="absolute top-1 left-1 w-full h-full pointer-events-none rounded-xl z-20">
                  {/* Added overflow-hidden and rounded-xl */}
                  <div
                    className="absolute w-1 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent rounded-full animate-border-light-2 shadow-[0_0_10px_2px_rgba(16,185,129,0.7)]" // Changed w-1/4 to w-1/2
                    style={{ transformOrigin: '0 0' }} // Set transform origin for proper rotation/movement
                  ></div>
                </div>

                {/* Dashboard image - adjusted rounding */}
                <motion.img
                  src="/dashboardpreview.png"
                  alt="Dashboard Preview"
                  className="rounded-lg block w-full h-full relative hidden md:block z-0 transition-all duration-300 group-hover:brightness-105" 
                  // Slightly reduced brightness on hover
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
