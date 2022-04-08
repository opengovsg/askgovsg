import './RichTextEditor.styles.scss'

import type { ReactChildren } from 'react'
import { ContentBlock, ContentState, DraftDecorator } from 'draft-js'

import styles from './RichTextEditor.module.scss'

const targetOptions: { [key: string]: string } = {
  'http:': '_blank',
  'https:': '_blank',
  'mailto:': '',
  'tel:': '',
}

const linkStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
): void => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    )
  }, callback)
}

const PreviewLinkSpan = ({
  children,
  contentState,
  entityKey,
}: {
  children: ReactChildren
  contentState: ContentState
  entityKey: string
}): JSX.Element => {
  const { url } = contentState.getEntity(entityKey).getData()
  let protocol
  try {
    protocol = new URL(url).protocol.toString()
  } catch {
    // If we fail to parse the URL, assume that it is bad,
    // and default to https
    // TODO: Find a way to flag this both to the public viewer
    // and the public servant
    protocol = 'https:'
  }
  if (protocol in targetOptions) {
    return (
      <span className="rdw-link-decorator-wrapper">
        <a href={url} className={styles.title} target={targetOptions[protocol]}>
          {children}
        </a>
      </span>
    )
  } else {
    return <></>
  }
}

export const PreviewLinkDecorator: DraftDecorator = {
  strategy: linkStrategy,
  component: PreviewLinkSpan,
}
