# JourneyTrigger - What is it?

Journey Trigger is a custom Salesforce Marketing Cloud Journey Builder Activity designed to trigger one journey from another. With a unique identifier mechanism and robust logging capabilities, this activity ensures seamless journey integrations and detailed tracking.

## Key Features

- **Retrieving Journeys**: Automatically retrieves journeys for your selection based on their entry source if it is APIEvent.
- **Persistence**: The activity remembers your selection in current and new versions.
- **Journey Integration**: Allows triggering of specified journeys based on API event keys.
- **Detailed Logging**: Logs the results of triggering journeys and shows it after the journey runs.

![Screenshot](/app_images/4.png)

![Screenshot](/app_images/6.png)

![Screenshot](/app_images/2.png)

![Screenshot](/app_images/3.png)

![Screenshot](/app_images/5.png)

## Getting Started

This application is developed for Heroku-hosted deployments, complementing Salesforce Marketing Cloud (SFMC) integration.

### Salesforce Marketing Cloud Setup

1. Create a Web App package with "Write" permissions under the "Data Extensions" section in SFMC.
2. Set the redirect URI to `https://yourherokudomain.herokuapp.com`.

For SFMC UI integration:

- Configure the "Login Endpoint" to `https://yourherokudomain.herokuapp.com/initiate-authorization/`.
- The "Logout Endpoint" can point to `https://yourherokudomain.herokuapp.com/log-out/`, though this URL is placeholder and should be customized as needed.

![Screenshot](/instruction_images/sfmc.jpg)

### Heroku Configuration

After deploying the app via a GitHub repository:

- Define the necessary configuration variables within Heroku's settings to match the SFMC package details.

![Screenshot](/instruction_images/heroku.png)

With these configurations, the app is ready for use.

## License

JourneyTrigger is open-sourced under the MIT License. See the LICENSE file for more details.

## Thanks

I used the template that Theon Thai Yun Tang created, which can be found here:

https://github.com/theonthai45/SFMC-custom-activity-template

---
