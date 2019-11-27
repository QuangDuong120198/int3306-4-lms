/**
 * @typedef {import('cassandra-driver').types.Uuid} Uuid
 * @typedef {import('cassandra-driver').types.TimeUuid} TimeUuid
 */

const _ = require('lodash');

const { Course, elasticsearchClient } = require('../models');

/**
 *
 * @param {object} course
 * @param {Uuid} course.teacherId
 * @param {Uuid} course.courseId
 * @param {string} [course.description='']
 * @param {string[]} [course.topics=undefined]
 * @param {string} course.courseName
 * @param {boolean} [course.archive=false]
 * @param {string[]} [course.members=[]]
 * @param {string[]} [fields]
 * @param {boolean} [insert=true]
 * @param {number} [ttl]
 */
function upsertCourse(course, fields, insert, ttl) {
  return Course.insert(
    {
      id: course.courseId,
      teacher_id: course.teacherId,
      description: course.description,
      course_name: course.courseName,
      created_at: Date.now(),
      topics: course.topics,
      archive: course.archive,
      members: course.members
    },
    {
      ifNotExists: insert,
      ttl: ttl,
      fields: fields
    }
  );
}

/**
 *
 * @param {Uuid} studentId
 * @param {number} [page=1]
 * @param {string | string[]} [includes]
 * @param {string | string[]} [excludes]
 */
function getCoursesByStudent(studentId, page = 1, includes, excludes) {
  page = _.toInteger(page);
  page = page < 1 ? 1 : page;

  studentId = String(studentId);

  return elasticsearchClient.search({
    index: 'lms.course',
    type: 'course',
    _source_includes: includes,
    _source_excludes: excludes,
    from: 10 * (page - 1),
    size: 10,
    body: {
      query: {
        term: {
          members: studentId
        }
      }
    }
  });
}

/**
 *
 * @param {Uuid} teacherId
 * @param {number} [page=1]
 * @param {string | string} [includes]
 * @param {string | string} [excludes]
 */
function getCoursesByTeacher(teacherId, page = 1, includes, excludes) {
  page = _.toInteger(page);
  page = page < 1 ? 1 : page;

  teacherId = String(teacherId);

  return elasticsearchClient.search({
    index: 'lms.course',
    type: 'course',
    _source_includes: includes,
    _source_excludes: excludes,
    from: 10 * (page - 1),
    size: 10,
    body: {
      query: {
        bool: {
          must: [{ term: { teacher_id: teacherId } }]
        }
      }
    }
  });
}

/**
 *
 * @param {Uuid} teacherId
 * @param {Uuid} courseId
 * @param {string | string[]} [includes]
 * @param {string | string[]} [excludes]
 */
function getCourseById(teacherId, courseId, includes, excludes) {
  teacherId = String(teacherId);
  courseId = String(courseId);

  const coursePrimaryKey = JSON.stringify([teacherId, courseId]);

  return elasticsearchClient.get({
    index: 'lms.course',
    type: 'course',
    id: coursePrimaryKey,
    _source_includes: includes,
    _source_excludes: excludes
  });
}

module.exports = {
  upsertCourse: upsertCourse,
  getCoursesByStudent: getCoursesByStudent,
  getCoursesByTeacher: getCoursesByTeacher,
  getCourseById: getCourseById
};