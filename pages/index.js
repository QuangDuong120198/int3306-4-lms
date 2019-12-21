/**
 * @typedef {{ id: string, teacher_id: string, course_name: string, created_at: string, archive?: boolean, description?: string, topics?: string | string[], members?: string | string[] }} Course
 * @typedef {{ searchResults: { courses: Course[], total: number }, query?: string, topics?: string[] }} SearchProps
 */
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-unfetch';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import NoSsr from '@material-ui/core/NoSsr';

import ReactSelectAsync from 'react-select/async';

import withLayout from '../components/hoc/withLayout';
import absURL from '../components/helpers/URL';
import { CourseType } from '../components/propTypes';
import CourseItem from '../components/CourseItem';
import { searchTopic } from '../components/helpers/searchTopic';
import { useSelectStyles } from '../components/styles/select';

const useStyles = makeStyles((theme) => ({
  cell: {
    padding: theme.spacing(2, 0)
  }
}));

/**
 * @type {React.FunctionComponent<SearchProps>}
 */
const HomePage = (props) => {
  const { searchResults, query, topics, page } = props;
  const [currentPage, setCurrentPage] = useState(page);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(query);
  const [searchTopics, setSearchTopics] = useState(topics);

  useEffect(() => {
    const encodeTopics = encodeURIComponent(JSON.stringify(topics));
    router.push({
      pathname: '/',
      query: { query: query, topics: encodeTopics, page: page }
    });
  }, [currentPage]);

  useEffect(() => {
    const encodeTopics = encodeURIComponent(JSON.stringify(searchTopics));
    router.push({
      pathname: '/',
      query: { query: searchQuery, topics: encodeTopics, page: 1 }
    });
  }, [searchQuery, searchTopics]);

  const totalPages = Math.ceil(searchResults.total / 10);
  const classes = useStyles();
  const selectClasses = useSelectStyles();

  return ((
    <>
      <Head>
        <title>Search Results</title>
      </Head>
      <Box>
        <Container maxWidth="xl">
          <Box pt={2} display="flex" flexDirection="column">
            <TextField
              placeholder="Search courses..."
              fullWidth
              variant="outlined"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              InputProps={{
                startAdornment: <Icon>search</Icon>
              }}
            />
            <Box pt={2} />
            <NoSsr>
              <ReactSelectAsync
                isMulti
                placeholder="Select topics..."
                loadOptions={searchTopic}
                styles={selectClasses}
                defaultValue={searchTopics.map((topic) => ({ label: topic, value: topic }))}
                onChange={(value) => {
                  if (value) {
                    setSearchTopics(value.map((currentSelectedOption) => currentSelectedOption.value));
                  } else {
                    setSearchTopics([]);
                  }
                }}
              />
            </NoSsr>
          </Box>
          <Table>
            <TableBody>
              {searchResults.courses.map((currentCourse) => {
                return (
                  <TableRow key={currentCourse.id}>
                    <TableCell className={clsx(classes.cell)}>
                      <CourseItem course={currentCourse} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {totalPages > 1 && (
              <TableFooter>
                <TableRow>
                  <TablePagination
                    count={searchResults.total}
                    page={currentPage - 1}
                    onChangePage={(event, page) => {
                      setCurrentPage(page + 1);
                    }}
                    rowsPerPage={10}
                    rowsPerPageOptions={[10]}
                  />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </Container>
      </Box>
    </>
  ));
};

HomePage.getInitialProps = async (context) => {
  const { query, topics, page = 1 } = context.query;
  let parsedTopics = [];
  try {
    parsedTopics = JSON.parse(topics);
    if (parsedTopics instanceof Array) {
      parsedTopics = parsedTopics.filter((element) => typeof element === 'string');
    } else {
      parsedTopics = [];
    }
  } catch {
    parsedTopics = [];
  }
  const searchResults = { courses: [], total: 0 };
  try {
    const courseRes = await fetch(absURL(`/api/search?query=${query}&topics=${topics}&page=${page}`));
    const courseJson = await courseRes.json();
    Object.assign(searchResults, courseJson);
    return {
      page: Number(page) || 1,
      query: query,
      topics: parsedTopics || [],
      searchResults: searchResults
    };
  } catch (err) {
    console.error(err);
    return {
      page: Number(page) || 1,
      query: query,
      topics: parsedTopics || [],
      searchResults: searchResults
    };
  }
};

HomePage.propTypes = {
  page: PropTypes.number,
  query: PropTypes.string,
  topics: PropTypes.arrayOf(PropTypes.string),
  searchResults: PropTypes.shape({
    courses: PropTypes.arrayOf(CourseType).isRequired,
    total: PropTypes.number.isRequired
  })
};

export default withLayout(HomePage);
