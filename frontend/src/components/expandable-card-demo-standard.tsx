'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { useOutsideClick } from 'src/hooks/use-outside-click';

export default function ExpandableCardDemo({ cards }: { cards: any[] }) {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(false);
      }
    }

    if (active && typeof active === 'object') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === 'object' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === 'object' ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
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
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[800px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-[#EAFFD0] sm:rounded-3xl overflow-hidden"
            >
              <div className="flex justify-center items-center ">
                {active.imagesUrl?.map((image, idx) => (
                  <motion.div
                    layoutId={`image-${image}-${id}`}
                    key={'images' + idx}
                    style={{
                      rotate: idx * 5 - 10,
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    whileTap={{
                      scale: 1.1,
                      rotate: 0,
                      zIndex: 100,
                    }}
                    className="rounded-xl -mr-4 mt-4 p-1 bg-[#F38181] border-[#F38181] border  shrink-0 overflow-hidden "
                  >
                    <img
                      src={image}
                      alt={image}
                      width="500"
                      height="500"
                      className="rounded-lg h-20 w-20 md:h-50 md:w-50 object-cover shrink-0 "
                    />
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex justify-between items-left p-4 pb-0 text-[#F38181]">
                  <div className="p-4 text-left ">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold "
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3  rounded-full font-bold  "
                  >
                    Voir l'annonce
                  </motion.a>
                </div>
                <div className="relative px-4 h-full text-[#F38181]">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className=" text-xs md:text-md  h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-scroll  [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === 'function'
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="mx-auto w-full gap-4 grid grid-cols-2  ">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-1 flex flex-col md:flex-row lg:justify-around   hover:bg-neutral-200   cursor-pointer"
          >
            <div className="flex gap-4 flex-col  justify-items-start">
              <motion.div layoutId={`image-${card.title}-${id}`}>
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
                    className="h-60 w-60 md:h-35 md:w-35  object-cover object-top hidden lg:block"
                  />
                </div>
              </motion.div>
              <div className="p-4">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-800  text-center md:text-left"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-600  text-center md:text-left"
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
