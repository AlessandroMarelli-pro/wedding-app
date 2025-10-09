'use client';

import { cn } from '@/lib';
import parse from 'html-react-parser';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { useOutsideClick } from 'src/hooks/use-outside-click';

export default function ExpandableCardDemo({ cards }: { cards: any[] }) {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null,
  );
  const [displayScrollbar, setDisplayScrollbar] = useState(true);

  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(false);
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'scroll';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  useEffect(() => {
    if (active) {
      setDisplayScrollbar(false);
    } else {
      setTimeout(() => {
        setDisplayScrollbar(true);
      }, 500);
    }
  }, [active]);
  return (
    <>
      {/* THE CARD DETAILS */}
      <AnimatePresence>
        {active && typeof active === 'object' ? (
          <motion.div
            layout
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              backdropFilter: 'blur(2px)',
            }}
            exit={{
              opacity: 0,
              backdropFilter: 'blur(0px)',
            }}
            className="fixed inset-0  flex place-items-center z-[100]  flex-col justify-center"
          >
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-[90%] lg:w-full max-w-[800px]  h-[70%] md:h-fit md:max-h-[90%]  flex flex-col bg-theme-muted    "
            >
              <motion.div
                className="md:h-30 h-18 flex justify-center items-center [&>*:nth-child(even)]:hidden md:[&>*:nth-child(even)]:block -translate-y-10 -translate-x-2 md:-translate-x-0"
                layoutId={` image-${active.id}-${id}`}
              >
                {active.imagesUrl?.map((image: string, idx: number) => (
                  <motion.div
                    layoutId={`image-${active.id}-${id}-${idx}`}
                    key={'images' + idx}
                    style={{
                      rotate: idx * 5 - 10,
                    }}
                    whileHover={{
                      scale: 1.5,
                      rotate: 0,

                      zIndex: 100000,
                    }}
                    whileTap={{
                      scale: 2,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    exit={{
                      scale: 1,
                      zIndex: 100,
                    }}
                    className="rounded-xl -mr-4 mt-4 p-1    shrink-0 overflow-hidden "
                  >
                    <img
                      src={image}
                      alt={image}
                      width="500"
                      height="500"
                      className="rounded-lg h-30 w-30 md:h-50 md:w-50 object-cover shrink-0 "
                    />
                  </motion.div>
                ))}
              </motion.div>

              <div className="overflow-y-scroll">
                <div className="flex justify-between items-left p-4 pb-0 text-theme-accent ">
                  <div className="lg:p-4 text-left ">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-lg lg:text-2xl"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.id}-${id}`}
                      className="text-xs lg:text-md "
                    >
                      {parse(
                        active.description?.replace(/(?:\r\n|\r|\n)/g, '<br>'),
                      )}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3  rounded-full font-bold text-sm lg:text-2xl"
                  >
                    Voir l'annonce
                  </motion.a>
                </div>
                <div className="relative lg:px-4 h-full text-theme-accent">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=" h-fit lg:pb-10 flex flex-col items-start gap-4 overflow-scroll  [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === 'function'
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* THE GRID OF CARDS */}
      <div
        className={cn(
          'mx-auto w-full gap-4 grid grid-cols-2  lg:max-h-[80vh] overflow-y-scroll',
          !displayScrollbar && 'overflow-hidden',
        )}
      >
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className="p-1 flex flex-col md:flex-row lg:justify-around   hover:bg-theme-muted text-theme-muted hover:text-theme-accent   cursor-pointer"
          >
            <div className="flex gap-4 flex-col  justify-items-start w-full ">
              <motion.div layoutId={`image-${card.id}-${id}`}>
                <div className="flex flex-row  justify-around">
                  <img
                    width={300}
                    height={300}
                    src={card.src}
                    alt={card.title}
                    className="h-60 w-60 md:h-35 md:w-35  object-cover object-top"
                  />
                  <img
                    width={300}
                    height={300}
                    src={card.image2}
                    alt={card.title}
                    className="h-60 w-60 md:h-35 md:w-35  object-cover object-top hidden md:block"
                  />
                </div>
              </motion.div>
              <div className="p-4">
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-medium   text-center md:text-left"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.id}-${id}`}
                  className=" text-center md:text-left"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
