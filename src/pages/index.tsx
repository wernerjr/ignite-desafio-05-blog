import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
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

function makePost(data: ApiSearchResponse): Post[] {
  return data.results.map(post => {
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
  }) as Post[];
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );
  function handleLoadPosts(): void {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        const postList = makePost(data);
        setPosts([...posts, ...postList]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <div className={commonStyles.Container}>
        <ul className={styles.contentContainer}>
          {posts.map(post => (
            <li key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
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
                </a>
              </Link>
            </li>
          ))}
        </ul>
        {nextPage && (
          <button
            type="button"
            className={styles.buttonLoading}
            onClick={handleLoadPosts}
          >
            Carregar mais posts
          </button>
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
  const posts = makePost(postsResponse);

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
    },
  };
};
