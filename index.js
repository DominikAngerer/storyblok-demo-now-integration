const axios = require('axios')
const { withUiHook } = require('@zeit/integration-utils')
const StoryblokClient = require('storyblok-js-client')

let password = ''
let email = ''

module.exports = withUiHook(async ({ payload, zeitClient }) => {
  const { clientState, action, user } = payload
  email = clientState.email || user.email

  const metadata = await zeitClient.getMetadata()
  metadata.store = metadata.store || { access_token: '', user_id: '', email: '' }

  if (action === 'register') {
    password = clientState.password
    try {
      let { data } = await axios.post('https://app.storyblok.com/v1/users/signup', {
        user: {
          email: email,
          password: clientState.password,
          otp_attempt: null
        },
        email: email
      })
      metadata.store.access_token = data.access_token
      metadata.store.user_id = data.user_id
      metadata.store.email = email

      // Resent password
      // await axios.post('https://app.storyblok.com/v1/users/resetpassword', {

      await zeitClient.setMetadata(metadata)
    } catch (e) {
      console.log(e)
    }
  }

  if (action === 'login') {
    password = clientState.password
    try {
      let { data } = await axios.post('https://app.storyblok.com/v1/users/login', {
        email: email,
        password: clientState.password,
        otp_attempt: null
      })
      metadata.store.access_token = data.access_token
      metadata.store.user_id = data.user_id
      metadata.store.email = email
    
      await zeitClient.setMetadata(metadata)

    } catch (e) {
      console.log(e)
    }
  }

  if (action === 'token') {
    metadata.store.access_token = clientState.access_token

    // load the user object spaces.
  }

  if (action == 'view' && metadata.store.access_token.length == 0) {
    return `
    <Page>
      <Container>
        <Fieldset>
          <FsContent>
            <H2>Welcome to Storyblok</H2>
            <P>Connecting with Storyblok will create a new FREE Storyblok account with the email: ${email}</P>
            <Button action="register">Connect to Storyblok</Button>
          </FsContent>
          <FsFooter>
            <P><Link action="view_login">Already have an Storyblok Account?</Link><BR />Connecting with Storyblok will start you on their FREE plan. No creditcard required. <Link href="https://www.storyblok.com/terms">View Storybloks Terms</Link></P>
          </FsFooter>
        </Fieldset>
      </Container>
    </Page>
    `
  }

  if (action == 'view_login' && metadata.store.access_token.length == 0) {
    return `
    <Page>
      <Container>
        <Fieldset>
          <FsContent>
            <H2>Welcome to Storyblok</H2>
            <Input label="E-mail" name="email" type="email" value="${email}" />
            <Input label="Password" name="password" type="password" value="${password}" />
            <Button action="login">Login</Button>
          </FsContent>
          <FsFooter>
            <P><Link action="view">Need a new Storyblok Account?</Link><BR />Connecting with Storyblok will start you on their FREE plan. No creditcard required. <Link href="https://www.storyblok.com/terms">View Storybloks Terms</Link></P>
          </FsFooter>
        </Fieldset>
      </Container>
    </Page>
    `
  }

  return `
  <Page>
    <Container>
      
      Actually do something here - link a ZeitHQ project with a Storyblok space? Get the preview/public tokens from a Storyblok space and store it as Env variable?

      <Link target="_blank" href="https://app.storyblok.com/#!/external_login?access_token=${metadata.store.access_token}&user_id=${metadata.store.user_id}&redirect_route=/build/59440">
      <Button>open storyblok</Button>
    </Link>

      </Box>
    </Container>
  </Page>
  `
})