"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroParallaxImages() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yPhoto1 = useTransform(scrollYProgress, [0, 1], [20, -30]);
  const yPhoto4 = useTransform(scrollYProgress, [0, 1], [35, -50]);
  const yPhoto5 = useTransform(scrollYProgress, [0, 1], [50, -70]);

  return (
    <div
      ref={containerRef}
      className="hidden lg:block lg:col-span-6 relative"
      style={{ minHeight: "520px" }}
    >
      <motion.div
        style={{ y: yPhoto1 }}
        className="absolute top-0 right-0 z-10 w-[400px] h-[300px] rounded-[4px] overflow-hidden group"
      >
        <Image
          src="/foto 1.jpg"
          alt="Juridische professionals aan het werk"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
          sizes="400px"
        />
      </motion.div>

      <motion.div
        style={{ y: yPhoto4 }}
        className="absolute top-[250px] right-[200px] z-20 w-[300px] h-[225px] rounded-[4px] overflow-hidden group"
      >
        <Image
          src="/foto 4.jpg"
          alt="Juridisch team in vergadering"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="300px"
        />
      </motion.div>

      <motion.div
        style={{ y: yPhoto5 }}
        className="absolute top-[450px] right-[100px] z-30 w-[200px] h-[150px] rounded-[4px] overflow-hidden group"
      >
        <Image
          src="/foto 5.jpg"
          alt="Young professional in de juridische sector"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="200px"
        />
      </motion.div>
    </div>
  );
}
