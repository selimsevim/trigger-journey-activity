# JourneyTrigger - What is it?

Journey Trigger is a custom Salesforce Marketing Cloud Journey Builder Activity designed to trigger one journey from another with the Journey Data of the current journey. With a unique identifier mechanism and robust logging capabilities, this activity ensures seamless journey integrations and detailed tracking.

## Key Features

- **Retrieving Journeys**: Automatically retrieves journeys for your selection based on their entry source if it is APIEvent.
- **Persistence**: The activity remembers your selection in current and new versions.
- **Journey Integration**: Allows triggering of specified journeys based on API event keys.
- **Detailed Logging**: Logs the results of triggering journeys and shows it after the journey runs.

## Important Considerations

1-Journey Data Dependency: This activity uses the Journey Data of the journey that incorporates the activity. Therefore, if the journey you intend to trigger has additional non-nullable or required fields, this activity will not function properly.
2-Entry Source Requirement: The entry source must be set before using the activity because the activity retrieves Journey Data from the entry source when it is saved.
3-Experimental Project Disclaimer: This project was created for fun rather than as a stable solution for large-scale Business Units. If you have 1,000 journeys and plan to use this trigger activity for a journey that sends to 1 million contacts, you will need to modify the log-showing part to prevent it from creating a huge mess.

## Potential Use Case

This activity can be used for projects where a complete customer journey cannot be created due to many phases or elements. By dividing that "whole" journey into more maintainable "little" journeys, if the criterion for subsequent journeys is simply "the contact must enter this after leaving the first or second journey," this activity simplifies and streamlines the process. Normally, you would need additional configuration to inject contacts into those journeys, but with this activity, it is simple and straightforward.

## Images

![Screenshot](/app_images/4.png)

![Screenshot](/app_images/6.png)

![Screenshot](/app_images/2.png)

![Screenshot](/app_images/3.png)

![Screenshot](/app_images/5.png)

## Getting Started

This activity is developed for Heroku-hosted deployments, complementing Salesforce Marketing Cloud (SFMC) integration. Postgre SQL has been used in addition to Node.

### Salesforce Marketing Cloud Setup

1. Create a Journey Builder Activity package along with Server-to-Server API Integration package that has the correct permissions for Journey data. 
2. Set the endpoint URL to `https://yourherokudomain.herokuapp.com`.
   
![Screenshot](/app_images/7.png)

This will automatically add Journey Activity into your Journey Builder UI.

### Heroku Configuration

First, you would need Heroku Postgres add-ons to handle database. This can be added on Overview. When you add the add-on, it automatically creates the necessary DATABASE_URL variable.

![Screenshot](/app_images/8.png)

![Screenshot](/app_images/9.png)

After deploying the app via a GitHub repository:

- Define the necessary configuration variables within Heroku's settings to match the SFMC package details.

![Screenshot](/app_images/10.png)

With these configurations, the app is ready for use.

## License

JourneyTrigger is open-sourced under the MIT License. See the LICENSE file for more details.

## Thanks

I used the template that Theon Thai Yun Tang created, which can be found here:

https://github.com/theonthai45/SFMC-custom-activity-template

---
