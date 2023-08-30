import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay, Pagination } from 'swiper/modules'
const images = import.meta.glob('../assets/cdsImages/*.{jpg,jpeg,png}')

export default function CDSSwiper({isOpen}) {
  const [imageUrls, setImageUrls] = useState([]);
  useEffect(() => {
    const loadImageUrls = async () => {
      const urls = await Promise.all(
        Object.keys(images).map(async (path) => {
          const module = await images[path]();
          return module.default;
        })
      );
      setImageUrls(urls);
    };

    loadImageUrls();
  }, []);

  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={1}
      centeredSlides={true}
      modules={[Autoplay, Pagination]}
      autoplay={{
        delay: 4000,
      }}
      pagination
      className={`h-full w-screen ${isOpen ? 'collapse' : 'visible'}`}
    >
      {imageUrls.map((url, i) => (
        <SwiperSlide key={i} className='h-full w-full z-0'>
          <img src={url} alt={url} className='h-full w-full object-cover m-auto' />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
