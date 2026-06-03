import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';

const carouselSlides = [
  {
    image: '/media/images/2600x1600/1.png',
    imageDark: '/media/images/2600x1600/1-dark.png',
    title: 'Secure Access Portal',
    description: (
      <>
        A robust authentication gateway ensuring
        <br /> secure&nbsp;
        <span className="text-gray-900 font-semibold">efficient user access</span>
        &nbsp;to the Metronic
        <br /> Dashboard interface.
      </>
    ),
  },
  {
    image: '/media/images/2600x1600/2.png',
    imageDark: '/media/images/2600x1600/2-dark.png',
    title: 'Advanced Analytics',
    description: (
      <>
        Comprehensive data visualization tools
        <br /> providing&nbsp;
        <span className="text-gray-900 font-semibold">actionable insights</span>
        &nbsp;for better
        <br /> decision making.
      </>
    ),
  },
  {
    image: '/media/images/2600x1600/3.png',
    imageDark: '/media/images/2600x1600/3-dark.png',
    title: 'Seamless Integration',
    description: (
      <>
        Easy integration with your existing
        <br /> systems ensuring&nbsp;
        <span className="text-gray-900 font-semibold">smooth workflow</span>
        &nbsp;and
        <br /> enhanced productivity.
      </>
    ),
  },
];

const Layout = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <style>
        {carouselSlides
          .map(
            (slide, index) => `
          .branded-bg-${index} {
            background-image: url('${toAbsoluteUrl(slide.image)}');
          }
          .dark .branded-bg-${index} {
            background-image: url('${toAbsoluteUrl(slide.imageDark)}');
          }
        `,
          )
          .join('\n')}
        {`
          .carousel-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          .carousel-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
          }
          
          .carousel-slide.active {
            opacity: 1;
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Outlet />
        </div>

        <div className="lg:rounded-xl lg:border lg:border-gray-200 lg:m-5 order-1 lg:order-2 relative overflow-hidden">
          <div className="carousel-container">
            {carouselSlides.map((slide, index) => (
              <div
                key={index}
                className={`carousel-slide bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg-${index} ${
                  index === currentIndex ? 'active' : ''
                }`}
              >
                <div className="flex flex-col p-8 lg:p-16 gap-4">
                  <Link to="/">
                    <img
                      src={toAbsoluteUrl('/media/app/mini-logo.svg')}
                      className="h-[28px] max-w-none"
                      alt=""
                    />
                  </Link>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {slide.title}
                    </h3>
                    <div className="text-base font-medium text-gray-600">
                      {slide.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Dots 
          <div className="absolute bottom-8 left-8 lg:left-16 flex gap-2 z-10">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-gray-900 w-8'
                    : 'bg-gray-900/30 hover:bg-gray-900/50'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          */}
        </div>
      </div>
    </>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };