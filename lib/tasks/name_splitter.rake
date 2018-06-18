# Task to split fullname into first and last via the first space in string
# Does not mutate fullname but replaces firstname and lastname
# Can be run over and over if errors occur
# Future versions must be backwards compatible
task :split_fullname => :environment do
  initial_size = Member.all.size
  members = Member.all.map do |m|
    next unless defined?(m.fullname) && !m.fullname.nil?
    name=m.fullname.split(" ")
    first=name.shift
    last=name.to_a.join(" ")
    m.firstname=first
    m.lastname=last
    m.save
    m
  end
  members = members.compact
  error = false;
  if members.size != initial_size then
    error = true;
    puts "ERROR, MISSING MEMBER:"
    puts "Initial: #{initial_size}"
    puts "Final: #{members.size}"
  end
  if Member.where(:lastname.nin => ["", nil]).size != initial_size
    error = true;
    puts "Members missing lastname"
    Member.where(:lastname.nin => ["", nil]).each { |m| puts "First: #{m.firstname}; Full: #{m.fullname}"; }
  end
  if Member.where(:firstname.nin => ["", nil]).size != initial_size
    error = true;
    puts "Members missing firstname"
    Member.where(:firstname.nin => ["", nil]).each { |m| puts "Last: #{m.lastname}; Full: #{m.fullname}"; }
  end
  if !error
    puts "Success."
  else
    puts "Error occured. Check logs."
  end
  puts "Would you like to inspect the results? (y/N)"
  answer = $stdin.gets.chomp
  if answer.downcase == 'y' then
    Member.each { |m| puts "First: #{m.firstname} | Last: #{m.lastname}"}
  end
  puts "Task complete; Closing."
end
