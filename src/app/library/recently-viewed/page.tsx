import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Lesson } from '@prisma/client';
import { db } from '@/lib/db';
import LessonList from '@/components/Lesson/LessonList';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const recentLessons: Lesson[] = [];

  const lessonIDLists = session
    ? await db.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          recentLessonIDs: true,
        },
      })
    : null;

  if (lessonIDLists) {
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
    <div>
      <LessonList lessons={recentLessons} session={session}></LessonList>
    </div>
  );
}
