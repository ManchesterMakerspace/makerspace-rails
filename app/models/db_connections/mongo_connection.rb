class MongoConnection < Mongo::Client

    PATH = 'localhost:27017'
    DATABASE_NAME = 'makerauth'
    COLLECTION_NAME = :members

    def self.connect_client
        client = self.new([PATH], database: DATABASE_NAME)
    end

    def self.connect_db
        self.connect_client.database
    end

    def self.find_collections
        self.connect_db.collections
    end

    def self.connect_collection
        self.connect_client[COLLECTION_NAME]
    end

    def self.list_members
        self.connect_collection.find.each do |document|
            puts document
        end
    end
end
