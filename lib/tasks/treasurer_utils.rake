
task :configure_transactions, [:input_file, :output_file] do |t, args|
  if args[:output_file] && !args[:output_file].match?(/(.csv)$/) then
    throw "Task can only be used with CSV files"
    return
  end
  output = args[:output_file] || "#{Rails.root}/dump/report_#{Time.now.strftime('%m-%d-%Y')}.csv"
end
