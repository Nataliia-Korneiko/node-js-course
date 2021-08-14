const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middleware/auth');

const router = Router();

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'name email') // user
      .select('title price img'); // course

    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }

  try {
    const course = await Course.findById(req.params.id);

    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }

    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/edit', auth, async (req, res) => {
  try {
    const { id } = req.body;
    delete req.body.id;

    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }

    // await Course.findByIdAndUpdate(id, req.body);
    Object.assign(course, req.body);
    await course.save();

    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });

    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
