require_relative '../error/google/share'
require_relative '../error/google/upload'

module Service
  module GoogleDrive
    def self.build_template_location(document)
      Rails.root.join("app/views/documents/#{document}.html.erb")
    end

    def self.get_folder_id(id)
      Rails.env.production? ? id : ENV['SIGNATURES_FOLDER']
    end

    def self.get_templates()
      {
        member_contract: {
          folder_id: get_folder_id(ENV['MEMBER_CONTRACT_FOLDER']),
          file_id: ENV["CONTRACT_ID"],
          template_location: build_template_location("member_contract")
        },
        code_of_conduct: {
          folder_id: get_folder_id(ENV['CODE_CONDUCT_FOLDER']),
          file_id: ENV["CODE_CONDUCT_ID"],
          template_location: build_template_location("code_of_conduct")
        },
        rental_agreement: {
          folder_id: get_folder_id(ENV['RENTAL_AGREEMENT_FOLDER']),
          file_id: ENV["RENTAL_AGREEMENT_ID"],
          template_location: build_template_location("rental_agreement")
        },
      }
    end

    def load_gdrive
      ::Service::GoogleDrive.load_gdrive
    end

    def self.load_gdrive
      google = Google::Apis::DriveV3::DriveService.new
      google.authorization = Google::Auth::UserRefreshCredentials.new({
        client_id: ENV['GOOGLE_ID'],
        client_secret: ENV['GOOGLE_SECRET'],
        refresh_token: ENV['GOOGLE_TOKEN'],
        scope: ["https://www.googleapis.com/auth/drive"]
      })
      google
    end

    def invite_gdrive(email_address)
      if ::Util.is_prod?
        permission = Google::Apis::DriveV3::Permission.new(type: :user,
            email_address: email_address,
            role: :reader)
        load_gdrive.create_permission(ENV['RESOURCES_FOLDER'], permission) do |result, err|
          raise Error::Google::Share.new(err) unless err.nil?
        end
      end
    end

    def self.upload_document(document_name, member, locals, base64_signature)
      sym_name = document_name.to_sym
      raise Error::NotFound.new unless (::Service::GoogleDrive.get_templates().keys.any? { |key| key.to_sym === sym_name })

      merged_locals = (locals || {}).merge({ member: member })

      template_hash = ::Service::GoogleDrive.get_templates()[sym_name]
      pdf_string = ::Service::GoogleDrive.generate_document_string(sym_name, merged_locals, base64_signature)
      pdf_meta = {
        name: ::Service::GoogleDrive.get_document_name(member, sym_name),
        parents: [template_hash[:folder_id]]
      }
      pdf = Tempfile.new("document", encoding: 'ascii-8bit')
      pdf.write(pdf_string)
      unless Rails.env.test?
        load_gdrive.create_file(pdf_meta,
                    fields: 'id',
                    upload_source: pdf.path,
                    content_type: 'application/pdf'
                    ) do |result, err|
          pdf.close()
          pdf.unlink()
          raise Error::Google::Upload.new(err) unless err.nil?
        end
      end
      pdf_string
    end

    def self.get_document_name(member, document_name)
      unique_id = member.kind_of?(Member) ? member.fullname : member.as_json
      "#{unique_id}_#{document_name}_#{Time.now.strftime('%m-%d-%Y')}.pdf"
    end

    def self.generate_document_string(document_name, locals = {}, base64_signature)
      file_name = ::Service::GoogleDrive.get_document_name(locals[:member], document_name)
      template_hash = ::Service::GoogleDrive.get_templates()[document_name]

      full_locals = {}.merge(locals)
      if base64_signature
        signature = "<h3>Signature:</h3><img width='100%' src='data:image/png;base64, #{base64_signature}' style='border: 1px solid black' />".html_safe
        full_locals[:signature] = signature
      end

      document = ApplicationController.new.render_to_string(
        "documents/#{document_name.to_s}.html.erb",
        locals: full_locals,
        layout: false,
        encoding: "UTF-8"
      )

      WickedPdf.new.pdf_from_string(document, page_size: "Letter", dpi: "300")
    end

    def upload_document(base64_signature, member, locals, document_name)
      ::Service::GoogleDrive.upload_document(base64_signature, member, locals, document_name)
    end

    def self.upload_backup(file_name)
      backup_meta = {
        name: file_name,
        parents: [ENV['BACKUPS_FOLDER']]
      }
      load_gdrive.create_file(
        backup_meta,
        fields: 'id',
        upload_source: Rails.root.join("dump", file_name).to_s,
      ) do |result, err|
        raise Error::Google::Upload.new(err) unless err.nil?
      end
    end

    def get_document(resource, document_name)
      ::Service::GoogleDrive.get_document(resource, document_name)
    end

    def self.get_document(resource, document_name)
      member_name = resource.kind_of?(Member) ? resource.fullname : resource.member.fullname
      signed_date = resource.kind_of?(Member) ? resource.member_contract_signed_date : resource.contract_signed_date
      raise ::Error::NotFound.new() if signed_date.nil?
      
      date_str = signed_date.strftime('%m-%d-%Y')

      drive = load_gdrive
      folder_id = get_templates()[document_name.to_sym][:folder_id]
      doc_name = "#{member_name}_#{document_name}_#{date_str}"

      doc = drive.list_files(
        q: "'#{folder_id}' in parents and name = '#{doc_name}.pdf'",
        fields: "files(id, web_content_link)",
      )

      first_match = doc.files[0]
      raise ::Error::NotFound.new() if first_match.nil?
      file = Tempfile.new([doc_name, ".pdf"], encoding: "ASCII-8BIT")

      drive.get_file(first_match.id, download_dest: file)
    end
  end
end