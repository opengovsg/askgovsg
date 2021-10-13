import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const index = fs.readFileSync(
  path.resolve(__dirname, '../../../..', 'client', 'build', 'index.html'),
)

export class WebService {
  /**
   * Returns agency page if agency exists
   * @param shortname agency shortname
   * @param longname agency longname
   * @returns html of agency page
   */
  getAgencyPage = async (
    shortname: string,
    longname: string,
  ): Promise<string | undefined> => {
    const $ = cheerio.load(index)

    $('title').text(`${shortname.toUpperCase()} FAQ - AskGov`)
    $('meta[property="og:title"]').attr(
      'content',
      `${shortname.toUpperCase()} FAQ - AskGov`,
    )
    $('meta[name="description"]').attr(
      'content',
      `Answers from ${longname} (${shortname.toUpperCase()})`,
    )
    $('meta[property="og:description"]').attr(
      'content',
      `Answers from ${longname} (${shortname.toUpperCase()})`,
    )

    return $.html()
  }

  /**
   * Returns post page
   * @param title post page title
   * @param description post page description
   * @returns html of post page
   */
  getQuestionPage = async (
    title: string,
    description: string,
  ): Promise<string | undefined> => {
    const $ = cheerio.load(index)

    $('meta[property="og:type"]').attr('content', 'article')

    $('title').text(`${title} - AskGov`)
    $('meta[property="og:title"]').attr('content', `${title} - AskGov`)

    $('meta[name="description"]').attr('content', `${description}`)
    $('meta[property="og:description"]').attr('content', `${description}`)

    return $.html()
  }
}
