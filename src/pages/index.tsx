import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import { getPrismicClient } from '../services/prismic';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <div className={styles.contentContainer}>
        <ul>
          {postsPagination.results.map(post => (
            <li key={post.uid}>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <FiCalendar />
                  {post.first_publication_date}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {postsPagination.next_page && (
          <button type="button">Carregar mais posts</button>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'publication.title',
        'publication.subtitle',
        'publication.author',
      ],
      pageSize: 1,
    }
  );

  const { next_page } = postsResponse;
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.last_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
    },
  };
};
