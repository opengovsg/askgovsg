export const renderLoginOtpBody = (otp: string, ip: string): string =>
  `Your OTP for AskGov is <b>${otp}</b>. Please use this to login to your AskGov account.<br><br>\
If your OTP does not work, please request for a new OTP at <a href="https://ask.gov.sg/">https://ask.gov.sg/</a>.<br><br>\
This login attempt was made from the IP: <u>${ip}</u>. If you did not attempt to log in to AskGov, you may choose to investigate this IP to address further. <br><br>\
<br>\
The AskGov Support Team`
