const { mapper } = require('./connector');

// CREATE TABLE IF NOT EXISTS "lesson" (
//     "id" timeuuid,
//     "course_id" uuid,
//     "teacher_id" uuid,
//     "title" text,
//     "content" text,
//     PRIMARY KEY (("course_id", "teacher_id"), "id")
// ) WITH CLUSTERING ORDER BY ("id" DESC);
module.exports = mapper(['lesson'], 'Lesson').forModel('Lesson');