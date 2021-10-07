import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const index = fs.readFileSync(
  path.resolve(__dirname, '../../../..', 'client', 'build', 'index.html'),
)

export class WebService {
  /**
   * Returns agency page if agency exists
   * @param index default index.html buffer
   * @param req request made
   * @param agencyService agency service initialised
   * @returns html of agency page if agency exists
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
   * @param index default index.html buffer
   * @param req request made
   * @param postService post service initialised
   * @param answersService answers service initialised
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
