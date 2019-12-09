import PropTypes from 'prop-types';
import NextLink from 'next/link';
import dayjs from 'dayjs';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';

import withLayout from '../../../../../../components/lib/withLayout';
import withCourse from '../../../../../../components/lib/withCourse';

const useStyles = makeStyles((theme) => ({
  examContainer: {
    padding: theme.spacing(2)
  },
  examLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none'
  }
}));

const mockExams = [
  {
    title: 'Exam 1',
    createdAt: dayjs().format('YYYY-MM-DD hh:mm A')
  },
  {
    title: 'Exam 2',
    createdAt: dayjs().format('YYYY-MM-DD hh:mm A')
  },
  {
    title: 'Exam 3',
    createdAt: dayjs().format('YYYY-MM-DD hh:mm A')
  }
];

function ExamItem(props) {
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Paper className={clsx(classes.examContainer)}>
        <NextLink href="/" prefetch={false}>
          <Link href="/" className={clsx(classes.examLink)}>
            <Typography title={props.title} color="primary" variant="h5">
              {props.title}
            </Typography>
          </Link>
        </NextLink>
        <Typography>{props.createdAt}</Typography>
      </Paper>
    </Grid>
  );
}

function CourseExam() {
  return (
    <>
      <Box py={2} />
      <Grid container spacing={2}>
        {mockExams.map((currentExam, currentExamIndex) => (
          <ExamItem key={currentExamIndex} {...currentExam} />
        ))}
      </Grid>
    </>
  );
}

ExamItem.propTypes = {
  title: PropTypes.string.isRequired,
  createdAt: PropTypes.string
};

export default withLayout(withCourse(CourseExam, 'exam'));