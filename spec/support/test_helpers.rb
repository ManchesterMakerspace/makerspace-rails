module TestHelpers
  def clear_email
    Dir.mkdir('tmp') unless Dir.exist?('tmp')
    Dir.mkdir('tmp/mail') unless Dir.exist?('tmp/mail')
    dir_path  = Rails.root.join("tmp/mail")
    Dir.foreach(dir_path) do |f|
      fn = File.join(dir_path, f)
      File.delete(fn) if f != '.' && f != '..'
    end
  end

  def read_email(file_name)
    email = ""
    File.open(Rails.root.join("tmp/mail/#{file_name}"), 'r') do |f|
      f.each_line do |l|
        email += l
      end
    end
    return Nokogiri::HTML.fragment(email)
  end

  def email_present(file_name)
    return File.exist?(Rails.root.join("tmp/mail/#{file_name}"))
  end

  def get_registration_token(file_name)
    email = read_email(file_name)
    token = email.css("a[href*='#{root_url}#/register']")
    address = token.first.values.last
    token_parts = address.split("/")

    token = {}
    token[:token] = token_parts.pop
    token[:id] = token_parts.pop
    return token
  end

  def number_to_currency(number)
    number.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(number.to_s).frac * 100).truncate)
  end
end
