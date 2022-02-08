import { useEffect, useState } from 'react';

import { GetStaticProps } from 'next';

import Head from 'next/head';

import Link from 'next/link';

import Prismic from '@prismicio/client';

import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import ExitPreviewMode from '../components/ExitPreviewMode';

import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  function formatPost(post: Post): Post {
    // const date = format(new Date(post.first_publication_date), 'dd MMM yyyy', {
    //   locale: ptBR,
    // });

    // const day = date.substring(0, 2);
    // const month = date.substring(3, 6);
    // const year = date.substring(7, 11);

    // const formattedMonth = month[0].toUpperCase() + month.slice(1);

    // const formattedDate = `${day} ${formattedMonth} ${year}`;

    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
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
  }

  useEffect(() => {
    const formattedPosts = postsPagination.results.map(post =>
      formatPost(post)
    );

    setPosts(formattedPosts);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.next_page, postsPagination.results]);

  async function handleLoadMorePost(): Promise<void> {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const newPosts: Post[] = data.results.map((post: Post) =>
          formatPost(post)
        );

        const existingPosts = [...posts];

        newPosts.map(post => existingPosts.push(post));

        setPosts(existingPosts);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <section>
          <img src="/images/logo.svg" alt="logo" />

          <div className={styles.postsContainer}>
            {posts.map(post => {
              return (
                <Link key={post.uid} href={`/post/${post.uid}`}>
                  <a>
                    <h1>{post.data.title}</h1>
                    <p>{post.data.subtitle}</p>

                    <div className={styles.postInfo}>
                      <div className={styles.createdAt}>
                        <FiCalendar color="#bbbbbb" />
                        <time>{post.first_publication_date}</time>
                      </div>

                      <div className={styles.author}>
                        <FiUser color="#bbbbbb" />
                        <span>{post.data.author}</span>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>

          {nextPage && (
            <button
              type="button"
              className={styles.buttonLoadMorePost}
              onClick={handleLoadMorePost}
            >
              Carregar mais posts
            </button>
          )}

          <ExitPreviewMode />
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'], // 'fetch' is basically what data I want to fetch from the posts
      pageSize: 1,
      orderings: '[document.last_publication_date desc]',
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
  };
};
