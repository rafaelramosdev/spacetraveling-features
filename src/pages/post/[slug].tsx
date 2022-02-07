import { GetStaticPaths, GetStaticProps } from 'next';

import { useRouter } from 'next/router';

import Head from 'next/head';

import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) {
    return (
      <div className={styles.fallBackPageContainer}>
        <h1 className={styles.fallBackPageText}>Carregando...</h1>
      </div>
    );
  }

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce((total, content) => {
    let t = total;

    t += content.heading.split(' ').length;

    const words = content.body.map(body => body.text.split(' ').length);

    words.map(word => (t += word));

    return t;
  }, 0);

  const estimatedTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <div className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <section className={commonStyles.container}>
        <div className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInfo}>
            <div className={styles.createdAt}>
              <FiCalendar color="#bbbbbb" />
              <time>{formattedDate}</time>
            </div>

            <div className={styles.author}>
              <FiUser color="#bbbbbb" />
              <span>{post.data.author}</span>
            </div>

            <div className={styles.estimatedTime}>
              <FiClock color="#bbbbbb" />
              <span>{estimatedTime} min</span>
            </div>
          </div>

          <div className={styles.contentContainer}>
            {post.data.content.map(content => {
              return (
                <div key={content.heading} className={styles.content}>
                  <h2>{content.heading}</h2>

                  {content.body.map(body => {
                    return <p key={body.text}>{body.text}</p>;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.uid'], // 'fetch' is basically what data I want to fetch from the posts
      pageSize: 2,
    }
  );

  const slugs = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('post', String(slug), {});

  const contents = response.data.content.map(content => {
    const bodys = content.body.map(body => {
      return body;
    });

    return {
      heading: content.heading,
      body: bodys,
    };
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: contents,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
