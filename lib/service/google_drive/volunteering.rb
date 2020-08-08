require_relative '../../error/google/share'
require_relative '../../error/google/upload'

module Service
  module GoogleDrive
    class Volunteering
      attr_accessor :drive, :headers, :member_ids

      MAX_MONTHLY_REQUIREMENT = {
        1 => 1,
        2 => 2,
        3 => 3,
        4 => 3,
        5 => 4,
        6 => 5,
        7 => 5,
        8 => 6,
        9 => 7,
        10 => 7,
        11 => 8,
        12 => 0,
      }

      # ID | Name | Start Date | # Req | # Comp | Dates -> infinium
      ID_INDEX = 0
      NAME_INDEX = 1
      START_DATE_INDEX = 2
      REQUIREMENTS_INDEX = 3
      COMPLETED_INDEX = 4
      DATES_START_INDEX = 5

      def initialize
        google = Google::Apis::SheetsV4::SheetsService.new
        google.authorization = Google::Auth::UserRefreshCredentials.new({
          client_id: ENV['GOOGLE_ID'],
          client_secret: ENV['GOOGLE_SECRET'],
          refresh_token: ENV['GOOGLE_TOKEN'],
          scope: ["https://www.googleapis.com/auth/drive"]
        })
        @drive = google
      end

      # Update member's yearly requirements
      def update_requirement_count(member_id)
        month_numeral = Time.now.month
        row_details = get_row_by_member_id(member_id) 
        current_reqs = row_details[:row][REQUIREMENTS_INDEX] || 0
        max_reqs = MAX_MONTHLY_REQUIREMENT[month_numeral]

        # Normalize requirements to not exceed maximums
        new_reqs = current_reqs.to_i + 1
        new_reqs = max_reqs if new_reqs > max_reqs

        update_spreadsheet_value(construct_cell_location(REQUIREMENTS_INDEX, row_details[:row_index]), new_reqs)
      end

      # Mark any blank cells with 0 or - depending on if they were a member the day of that activity
      def update_eligibility(member_id)
        row_details = get_row_by_member_id(member_id) 
        headers = get_headers

        # New headers will not be found in rows. Add empty cells for the new headers
        row_cells = row_details[:row].concat(Array.new(headers.size - row_details[:row].size)).slice(DATES_START_INDEX..-1)
        # Map adding index to compare to headers
        blank_indexes = row_cells.each_index.select { |i| row_cells[i] == "" || row_cells[i].nil? }.map { |i| i + DATES_START_INDEX }

        blank_dates = headers.each_with_index.select { |date, index| blank_indexes.include?(index) }
        blank_dates.each do |date_tuple|
          date = Date.strptime(date_tuple[0], "%m/%d/%Y")
          index = date_tuple[1]
          # Convert Row#: Col# -> Letter:Col#
          range = construct_cell_location(index, row_details[:row_index])
          is_active = ::MembershipSnapshot.find_by(date: date, active_members: member_id)
          if is_active
            update_spreadsheet_value(range, "-")
          else
            update_spreadsheet_value(range, "N/A")
          end
        end
        sleep 1
      end
      
      # Add new member row to spreadsheet
      def add_to_spreadsheet(member)
        member = Member.find(member) unless member.is_a?(Member)

        # Find first volunteer date that member would qualify for
        first_possible_date_index = get_headers.find_index { |h| Date.strptime(h, "%m/%d/%Y") >= member.startDate rescue false } || ::Service::GoogleDrive::Volunteering::DATES_START_INDEX
        
        # Add ID, Name, Start Date and mark all invalid dates with x
        new_row = [
          member.id, 
          member.fullname, 
          member.startDate.strftime("%m-%d-%Y"), 
          nil,
          '=COUNTIFS($F245:$Z245, "?*", $F245:$Z245, "<>-", $F245:$Z245, "<>N/A")',
          *(Array.new(first_possible_date_index - DATES_START_INDEX) { |i| "N/A" })
        ]

        values_range = ::Google::Apis::SheetsV4::ValueRange.new(values: [new_row])
        @drive.append_spreadsheet_value(ENV["VOLUNTEER_SPREADSHEET"], ["A1:AAA1"], values_range, value_input_option: "USER_ENTERED")  do |result, err|
          raise Error::Google::Upload.new(err) unless err.nil?
        end
      end

      private
      def get_row(row_index)
        "A#{row_index + 1}:AAA#{row_index + 1}"
      end

      def get_column(column_index)
        letter = letter_from_index(column_index)
        "#{letter}1:#{letter}10000"
      end

      def letter_from_index(index)
        ("A".."Z").to_a[index]
      end

      def construct_cell_location(column, row_index)
        letter = column.is_a?(String) ? column : letter_from_index(column)
        "#{letter}#{row_index + 1}"
      end

      def update_spreadsheet_value(range, value)
        value = [value] unless value.is_a?(Array)
        values_range = ::Google::Apis::SheetsV4::ValueRange.new(values: [value])
        @drive.update_spreadsheet_value(ENV["VOLUNTEER_SPREADSHEET"], [range], values_range, value_input_option: "RAW" ) do |result, err|
          raise Error::Google::Upload.new(err) unless err.nil?
        end
      end

      # Search ID column and return full member row
      def get_row_by_member_id(member_id)
        member_id_str = member_id_as_str(member_id)
        @member_ids ||= @drive.get_spreadsheet_values(ENV["VOLUNTEER_SPREADSHEET"], get_column(ID_INDEX)).values.flatten
        member_index = @member_ids.find_index { |id| id == member_id_str }
        if member_index.nil? # If member doesnt exist for some reason, add them to the bottom and search again
          add_to_spreadsheet(member_id_str)
          @member_ids.push(member_id_str)
          sleep 1
          return get_row_by_member_id(member_id_str)
        end

        return {
          row_index: member_index,
          row_range: get_row(member_index),
          row: @drive.get_spreadsheet_values(ENV["VOLUNTEER_SPREADSHEET"], get_row(member_index)).values.flatten
        }
      end

      def member_id_as_str(member_id)
        member_id.kind_of?(String) ? member_id : member_id.as_json
      end

      def get_headers
        @headers ||= @drive.get_spreadsheet_values(ENV["VOLUNTEER_SPREADSHEET"], get_row(0)).values.flatten
      end
    end
  end
end