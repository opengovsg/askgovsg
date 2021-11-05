import { Helmet } from 'react-helmet-async'

const PageTitle = ({
  title,
  description,
}: {
  title?: string
  description?: string
}): JSX.Element => {
  const defaultTitle = 'AskGov'
  const defaultDescription = 'Answers from the Singapore Government'

  return (
    <Helmet>
      <title>{title ? title : defaultTitle}</title>
      <meta
        name="description"
        content={description ? description : defaultDescription}
      />
    </Helmet>
  )
}

export default PageTitle
