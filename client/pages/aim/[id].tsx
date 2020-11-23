import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import AimCard from '../../components/AimCard'
import AuthGuard from '../../components/AuthGuard'
import DotCalendar from '../../components/DotCalendar'
import Layout from '../../components/Layout'

type AimDetailProps = {
  aim: object
  errorMessage: string
}

const AimDetail: FunctionComponent<AimDetailProps> = ({ aim, errorMessage }) => {
  if (!aim || errorMessage) {
    return (
      <Layout>
        <Container>
          <h2>Error</h2>
          <p>{errorMessage || 'Unable to fetch aim. Please try again later'}</p>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <AuthGuard>
        <Head>
          <title>AimDetail | twelvemonth</title>
          <link rel="icon" href="/favicon_1.ico" />
        </Head>

        <Container>
          <AimCard aim={aim} />
          <Divider />
          <DotCalendar />
        </Container>
      </AuthGuard>
    </Layout>
  )
}

export default AimDetail

export const getServerSideProps: GetServerSideProps = async (context) => {
  let aim = null
  let errorMessage = ''
  try {
    const { id } = context.params
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL_SSR}/aims/${id}`, {
      headers: context.req ? { cookie: context.req.headers.cookie } : undefined,
      credentials: 'include',
    })
    const data = await res.json()

    if (data.status === 'Success') {
      aim = data.aim
    } else {
      throw new Error(data.message)
    }
  } catch (e) {
    if (e instanceof Error) {
      errorMessage = e.message
    }
  }

  return {
    props: { aim, errorMessage },
  }
}

const Divider = styled.hr`
  margin: 1rem 0;
  border: none;
  height: 2px;
  background-color: ${(props) => props.theme.grey['700']};
`

const Container = styled.main`
  max-width: 500px;
  margin: 4rem auto 2rem;
`
