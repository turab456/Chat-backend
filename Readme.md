npx sequelize-cli db:migrate

Runs all pending migrations to apply database schema changes (tables, columns, constraints).
Ensures your database structure is up to date with your models and migrations.
2️⃣ npx sequelize-cli db:seed:all

Runs all seed files to insert dummy/test data into your database.
Useful for pre-populating tables with initial data.


# In config.json change the db details and also in the .env

# define the relationships in association not dont use association use only model folder to create the model and create the table sync it in the models only below is the example
sequelize.sync({alter : true})

# if you are creating any model import it in dbSync


#   l m s _ s e r v e r  
 