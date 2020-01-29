class MembershipSnapshot
  include Mongoid::Document

  field :date, type: Date
  field :active_members, type: Array

  def self.get_active_month
    last_day_of_month = Time.now.utc.end_of_month
    first_day_of_month = Time.now.utc.beginning_of_month
    MembershipSnapshot.where(date: { "$gte" => first_day_of_month, "$lte" => last_day_of_month })
  end

# Back filling snapshot for a range of days
# (12..28).map { |date| Date.strptime("01/#{date}/2020", "%m/%d/%Y") }.map { |date| MembershipSnapshot.create(date: date, active_members:  Member.where(startDate: { "$lte" => date }, expirationTime: { '$gte' => date.to_time.to_i * 1000 }).map { |m| m.id.as_json }) }
# (1..11).map { |date| Date.strptime("01/#{date}/2020", "%m/%d/%Y") }.map { |date| MembershipSnapshot.create(date: date, active_members:  Member.where(startDate: { "$lte" => date }, expirationTime: { '$gte' => date.to_time.to_i * 1000 }).map { |m| m.id.as_json }) }
end