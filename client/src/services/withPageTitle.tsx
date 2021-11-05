import PageTitle from '../components/PageTitle/PageTitle.component'

const withPageTitle = ({
  component: Component,
  title,
}: {
  component: () => JSX.Element
  title?: string
}): (() => JSX.Element) => {
  return () => (
    <>
      <PageTitle title={title} />
      <Component />
    </>
  )
}

export default withPageTitle
