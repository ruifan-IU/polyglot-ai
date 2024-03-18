import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Tab } from '@headlessui/react';
import LessonList from '@/components/Lesson/LessonList';
import LessonTabs from '@/components/Lesson/LessonTabs';

export default async function Home() {
  revalidatePath('/');
  const session = await getServerSession(authOptions);
  const bookmarked = session
    ? await db.lesson.findMany({
        where: {
          bookmarkedByIDs: {
            has: session.user?.id,
          },
        },
      })
    : [];
  const lessons = await db.lesson.findMany();

  return (
    <main className='flex flex-col items-center justify-between p-5 sm:p-10'>
      <LessonTabs lessons={lessons} bookmarked={bookmarked} />
    </main>
  );
}
