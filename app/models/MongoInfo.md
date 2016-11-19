collection.find.each do |document|
    #=> Yields a BSON::Document.
end

result = collection.update_one( { 'name' => 'Sally' }, { '$set' => { 'phone_number' => "555-555-5555" } } )
result = collection.update_many( {}, { '$set' => { 'age' => 36 } } )
result = collection.delete_one( { name: 'Steve' } )
result = collection.delete_many({ name: /$S*/ })
collection.insert_many([ { _id: 3, name: "Arnold" }, { _id: 4, name: "Susan" } ])

doc = { name: 'Steve', hobbies: [ 'hiking', 'tennis', 'fly fishing' ] }
result = collection.insert_one(doc)


class Person
  include Mongoid::Document
  field :first_name, type: String
  store_in collection: "citizens", database: "other", client: "secondary"
end

Below is a list of valid types for fields.

Array
BigDecimal
Boolean
Date
DateTime
Float
Hash
Integer
BSON::ObjectId
BSON::Binary
Range
Regexp
String
Symbol
Time
TimeWithZone
