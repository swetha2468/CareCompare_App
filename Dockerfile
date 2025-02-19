# Use official JDK 17 base image
FROM eclipse-temurin:17-jdk

# Set the working directory in the container
WORKDIR /app

# Copy the built JAR file into the container
COPY target/CareCompare_App-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

