"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Job } from "@/types";
import VacatureCard from "@/components/VacatureCard";

interface Props {
  jobs: Job[];
}

export default function VacatureCarousel({ jobs }: Props) {
  const [displayJobs, setDisplayJobs] = useState<Job[]>([]);

  useEffect(() => {
    const shuffled = [...jobs].sort(() => Math.random() - 0.5);
    setDisplayJobs(shuffled.slice(0, 8));
  }, [jobs]);

  if (displayJobs.length === 0) return null;

  return (
    // Wrapper clips only horizontally so hover shadow/scale on cards can
    // render fully above and below without being cut off. Vertical padding
    // (compensated by negative margin) reserves room for the shadow.
    <div
      style={{
        overflowX: "clip",
        overflowY: "visible",
        paddingTop: 24,
        paddingBottom: 24,
        marginTop: -24,
        marginBottom: -24,
      }}
    >
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={displayJobs.length > 3}
        breakpoints={{
          0:    { slidesPerView: 1, spaceBetween: 24 },
          640:  { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 32 },
        }}
        className="!overflow-visible"
      >
        {displayJobs.map((job) => (
          <SwiperSlide key={job.id} style={{ height: "auto" }}>
            <VacatureCard job={job} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
