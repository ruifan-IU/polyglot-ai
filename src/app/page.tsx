import Link from 'next/link';
import { db } from '@/lib/db';
import { Lesson } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import EmblaCarousel from '@/components/Lesson/Carousel/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import LevelSelection from '@/components/Lesson/LevelSelection';
import LessonSearch from '@/components/Lesson/LessonSearch';
import { redirect } from 'next/navigation';

type searchParamsType = {
  [key: string]: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: searchParamsType;
}) {
  const OPTIONS: EmblaOptionsType = { slidesToScroll: 'auto' };
  const bookmarkedLessons: Lesson[] = [];
  const likedLessons: Lesson[] = [];
  const recentLessons: Lesson[] = [];

  let minLevel = 1;
  let maxLevel = 6;

  if (searchParams.minLevel && searchParams.maxLevel) {
    minLevel = parseInt(searchParams.minLevel);
    maxLevel = parseInt(searchParams.maxLevel);
  }

  const session = await getServerSession(authOptions);
  console.log('session', session);

  if (!session) {
    redirect('/welcome');
  }

  const publicLessons = await db.lesson.findMany({
    where: {
      public: true,
    },
  });

  publicLessons.sort((a, b) => {
    return b.likedByIDs.length - a.likedByIDs.length;
  });
  const lessonIDLists = session
    ? await db.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          bookmarkIDs: true,
          likedIDs: true,
          recentLessonIDs: true,
        },
      })
    : null;

  if (lessonIDLists) {
    for (const lessonID of lessonIDLists.bookmarkIDs) {
      const lesson = await db.lesson.findUnique({
        where: {
          id: lessonID,
        },
      });
      if (lesson) {
        bookmarkedLessons.push(lesson);
      }
    }
    for (const lessonID of lessonIDLists.likedIDs) {
      const lesson = await db.lesson.findUnique({
        where: {
          id: lessonID,
        },
      });
      if (lesson) {
        likedLessons.push(lesson);
      }
    }
    for (const lessonID of lessonIDLists.recentLessonIDs) {
      const lesson = await db.lesson.findUnique({
        where: {
          id: lessonID,
        },
      });
      if (lesson) {
        recentLessons.push(lesson);
      }
    }
  }

  return (
    <main className='flex w-full flex-col items-center justify-between'>
      <div className='flex w-full flex-col items-center justify-between md:flex-row'>
        <div className='top z-10 w-full'>
          <LessonSearch />
        </div>
        <div className='w-full'>
          <div className='text-center font-semibold text-slate-600'>
            Select Level:
          </div>
          <LevelSelection />
        </div>
      </div>
      {session ? (
        <div>
          {recentLessons.length ? (
            <section className='mb-4'>
              <div className='flex w-full flex-row items-center justify-between'>
                <h1 className='ml-10 p-4 font-semibold text-slate-600'>
                  Recently Studied:
                </h1>
                <Link className='mr-10 p-4' href='/library/recently-viewed'>
                  <button className='h-10 w-24 rounded-lg text-center text-slate-600 transition-colors duration-300 hover:bg-slate-100'>
                    View All &gt;
                  </button>
                </Link>
              </div>
              <EmblaCarousel
                slides={recentLessons.filter((lesson) => {
                  return lesson.level >= minLevel && lesson.level <= maxLevel;
                })}
                session={session}
                options={OPTIONS}
              />
            </section>
          ) : null}
          {bookmarkedLessons.length ? (
            <section className='mb-4'>
              <div className='flex w-full flex-row justify-between'>
                <h1 className='ml-10 p-4 font-semibold text-slate-600'>
                  Saved Lessons:
                </h1>
                <Link className='mr-10 p-4' href='/library/currently-studying'>
                  <button className='h-10 w-24 rounded-lg text-center text-slate-600 transition-colors duration-300 hover:bg-slate-100'>
                    View All &gt;
                  </button>
                </Link>
              </div>
              <EmblaCarousel
                slides={bookmarkedLessons.filter((lesson) => {
                  return lesson.level >= minLevel && lesson.level <= maxLevel;
                })}
                session={session}
                options={OPTIONS}
              />
            </section>
          ) : null}
          {likedLessons.length ? (
            <section className='mb-4'>
              <div className='flex w-full flex-row justify-between'>
                <p className='ml-10 p-4 font-semibold text-slate-600'>
                  My Likes:
                </p>
                <Link className='mr-10 p-4' href='/library/liked'>
                  <button className='h-10 w-24 rounded-lg text-center text-slate-600 transition-colors duration-300 hover:bg-slate-100'>
                    View All &gt;
                  </button>
                </Link>
              </div>
              <EmblaCarousel
                slides={likedLessons.filter((lesson) => {
                  return lesson.level >= minLevel && lesson.level <= maxLevel;
                })}
                session={session}
                options={OPTIONS}
              />
            </section>
          ) : null}
          <section className='mb-4'>
            <div className='flex w-full flex-row justify-between'>
              <h1 className='ml-10 p-4 font-semibold text-slate-600'>
                Trending:
              </h1>
              <Link className='mr-10 p-4' href='/library/trending'>
                <button className='h-10 w-24 rounded-lg text-center text-slate-600 transition-colors duration-300 hover:bg-slate-100'>
                  View All &gt;
                </button>
              </Link>
            </div>
            <EmblaCarousel
              slides={publicLessons.filter((lesson) => {
                return lesson.level >= minLevel && lesson.level <= maxLevel;
              })}
              session={session}
              options={OPTIONS}
            />
          </section>
        </div>
      ) : (
        ''
      )}
    </main>
  );
}
