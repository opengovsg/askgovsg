import { Box, Center, Container, Text } from '@chakra-ui/react'
import { ScrollToTopOnMount } from '../ScrollToTop/ScrollToTop.component'
import './PrivacyTerms.styles.scss'

const CitizenPrivacy = (): JSX.Element => (
  <>
    <ScrollToTopOnMount />
    <Box bg="primary.500" h="174px">
      <Text
        textStyle="display-2"
        color="white"
        py="50px"
        px={{ base: '30px', sm: '100px' }}
        maxW="1100px"
        m="auto"
        w="100vw"
      >
        Privacy Policy
      </Text>
    </Box>
    <Container
      id="privacy-tou"
      maxW="1100px"
      m="auto"
      w="100vw"
      py="66px"
      px={{ base: '30px', sm: '100px' }}
    >
      <li data-seq="">
        <p>
          This Privacy Policy must be read in conjunction with the Terms of Use
          that accompany the applicable service you are requesting from us (the
          <b>"Service"</b>). If you are a form respondent, this Privacy Policy
          will also apply in addition to any other privacy policy that the form
          creator provides to you as part of the form. In this Privacy Policy,
          <b>"Public Sector Entities"</b> means the Government (including its
          ministries, departments and organs of state) and public authorities
          (such as statutory boards) and "personal data" shall have the same
          meaning as its definition in the Personal Data Protection Act 2012
          (No. 26 of 2012).
        </p>
      </li>
      <ol>
        <li data-seq="1">
          Insofar as the Service consists of or is provided to you through a
          website, please note that:
          <ol>
            <li data-seq="1.1">
              We may use "cookies", where a small data file is sent to your
              browser to store and track information about you when you enter
              our websites. The cookie is used to track information such as the
              number of users and their frequency of use, profiles of users and
              their preferred sites. While this cookie can tell us when you
              enter our sites and which pages you visit, it cannot read data off
              your hard disk.
            </li>
            <li data-seq="1.2">
              You can choose to accept or decline cookies. Most web browsers
              automatically accept cookies, but you can usually modify your
              browser setting to decline cookies if you prefer. This may prevent
              you from taking full advantage of the website.
            </li>
          </ol>
        </li>
        <li data-seq="2">
          We may request/collect certain types of data from you in connection
          with your access or use of the Service. The data that may be
          requested/collected include those identified in the Annex herein. Your
          data may be stored in our servers, systems or devices, in the servers,
          systems or devices of our third party service providers or
          collaborators, or on your device, and may be used by us or our third
          party service providers or collaborators to facilitate your access or
          use of the Service. We or our third party service providers or
          collaborators may collect system configuration information and/or
          traffic information (such as an IP address) and/or use information or
          statistical information to operate, maintain or improve the Services
          or the underlying service of the third party service provider or
          collaborator. For the avoidance of doubt, in this Privacy Policy, a
          reference to a third party service provider or collaborator includes
          other third parties who provide a service or collaborate with our
          third party service provider or collaborator.
        </li>
        <li data-seq="3">
          If you provide us with personal data:
          <ol>
            <li data-seq="3.1">
              We may use, disclose and process the data for any one or more of
              the following purposes:
              <ol>
                <li data-seq="3.1.1">
                  to assist, process and facilitate your access or use of the
                  Service;
                </li>
                <li data-seq="3.1.2">
                  to administer, process and facilitate any transactions or
                  activities by you, whether with us or any other Public Sector
                  Entity or third party service provider or collaborator, and
                  whether for your own benefit, or for the benefit of a third
                  party on whose behalf you are duly authorized to act;
                </li>
                <li data-seq="3.1.3">
                  to carry out your instructions or respond to any queries,
                  feedback or complaints provided by (or purported to be
                  provided by) you or on your behalf, or otherwise for the
                  purposes of responding to or dealing with your interactions
                  with us;
                </li>
                <li data-seq="3.1.4">
                  to monitor and track your usage of the Service, to conduct
                  research, data analytics, surveys, market studies and similar
                  activities, in order to assist us in understanding your
                  interests, concerns and preferences and improving the Service
                  (including any service of a third party service provider or
                  collaborator) and other services and products provided by
                  Public Sector Entities. For the avoidance of doubt, we may
                  also collect, use, disclose and process such information to
                  create reports and produce statistics regarding your
                  transactions with us and your usage of the Services and other
                  services and products provided by Public Sector Entities for
                  record-keeping and reporting or publication purposes (whether
                  internally or externally);
                </li>
                <li data-seq="3.1.5">
                  for the purposes of storing or creating backups of your data
                  (whether for contingency or business continuity purposes or
                  otherwise), whether within or outside Singapore;
                </li>
                <li data-seq="3.1.6">
                  to enable us to contact you or communicate with you on any
                  matters relating to your access or use of the Service,
                  including but not limited to the purposes set out above, via
                  email, SMS, instant messaging, push notifications or such
                  other forms of communication that we may introduce from time
                  to time depending on the functionality of the Service and/or
                  your device.
                </li>
              </ol>
            </li>
            <li data-seq="3.2">
              We may share necessary data with other Public Sector Entities, and
              third party service providers in connection with the Service, so
              as to provide the Service to you in the most efficient and
              effective way unless such sharing is prohibited by law.
            </li>
            <li data-seq="3.3">
              We will NOT share your personal data with entities which are not
              Public Sector Entities, except where such sharing is necessary for
              such entities to assist us in providing the Service to you or for
              fulfilling any of the purposes herein.
            </li>
            <li data-seq="3.4">
              For your convenience, we may also display to you data you had
              previously supplied us or other Public Sector Entities. This will
              speed up the transaction and save you the trouble of repeating
              previous submissions. Should the data be out-of-date, please
              supply us the latest data.
            </li>
          </ol>
        </li>
        <li data-seq="4">
          Please note that we may be required to disclose your data by law,
          including any law governing the use/provision of any service of a
          third party service provider or collaborator.
        </li>
        <li data-seq="5">
          To safeguard your personal data, all electronic storage and
          transmission of personal data is secured with appropriate security
          technologies.
        </li>
        <li data-seq="6">
          You may withdraw your consent to the use and disclosure of your data
          by us with reasonable notice and subject to any prevailing legal or
          contractual restrictions; however, doing so may prevent the proper
          functioning of the Service and may also result in the cessation of the
          Service to you.
        </li>
        <li data-seq="7">
          The Service may contain links to external sites whose data protection
          and privacy practices may differ from ours. We are not responsible for
          the content and privacy practices of these other websites and
          encourage you to consult the privacy notices of those sites.
        </li>
        <li data-seq="8">Please see the Annex for additional terms/notices.</li>
        <li data-seq="9">
          <span>
            Please contact{' '}
            <a href="mailto:formsg@tech.gov.sg">askgov@open.gov.sg</a> if you:
          </span>
          <ol>
            <li>
              <ol>
                <li data-seq="9.1">
                  have any enquiries or feedback on our data protection policies
                  and procedures; or
                </li>
                <li data-seq="9.2">
                  need more information on or access to data which you have
                  provided to us in the past.
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>
      <br />
      <br />
      <Center textColor="secondary.500">
        This Privacy Policy is dated 26 July 2021.
      </Center>
      <br />
      <h1 className="tou-point-bold">ANNEX</h1>
      <ol>
        <li>
          <ol>
            <li data-seq="1">
              <span>Name of Service: Ask.gov.sg</span>
            </li>
            <li data-seq="2">
              <span>Types of data requested/collected:</span>
              <ol>
                <li data-seq="a.">
                  User behavioural data on site, such as clicks and views
                </li>
                <li data-seq="b.">
                  Personal Identifiable Information (e.g. NRIC, Name, contact
                  information, etc.) and data contained in queries or feedback
                  from you when filling out a support form.
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>
    </Container>
  </>
)

export default CitizenPrivacy
