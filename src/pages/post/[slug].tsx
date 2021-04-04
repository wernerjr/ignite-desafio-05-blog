import { format } from 'date-fns';
import Prismic from '@prismicio/client';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import PreviewButton from '../../components/PreviewButton';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;

  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

function showUterancesComments(): void {
  const script = document.createElement('script');
  const anchor = document.getElementById('inject-comments-for-uterances');
  script.setAttribute('src', 'https://utteranc.es/client.js');
  script.setAttribute('crossorigin', 'anonymous');
  script.setAttribute('async', 'true');
  script.setAttribute('repo', 'wernerjr/ignite-desafio-05-blog');
  script.setAttribute('issue-term', 'pathname');
  script.setAttribute('theme', 'github-dark');
  anchor.appendChild(script);
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  useEffect(() => {
    if (!router.isFallback) {
      const totalWordsCount = post.data.content.reduce((acc, now) => {
        return acc + RichText.asText(now.body).match(/\S+/g).length;
      }, 0);
      setEstimatedReadTime(Math.ceil(totalWordsCount / 200));
      showUterancesComments();
    }
  }, [post, router.isFallback]);

  if (router.isFallback) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="banner" />
      <div className={commonStyles.Container}>
        <header className={styles.headerContainer}>
          <h1>{post.data.title}</h1>
          <div>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {estimatedReadTime} min
            </span>
          </div>
          {post.last_publication_date && (
            <span>
              {`* editado em ${format(
                new Date(post.last_publication_date),
                "dd MMM yyyy', às' HH:MM",
                {
                  locale: ptBR,
                }
              )}`}
            </span>
          )}
        </header>
        <main className={styles.mainContainer}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h1>{content.heading}</h1>
              {content.body.map(body => (
                <p key={body.text}>{body.text}</p>
              ))}
            </div>
          ))}
        </main>
        <div id="inject-comments-for-uterances" />
        {preview && <PreviewButton />}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 1,
    }
  );

  const params = posts.results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  console.log(response);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 1,
  };
};
