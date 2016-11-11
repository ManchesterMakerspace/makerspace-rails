class LDAPConnection < Net::LDAP
    attr_accessor :filter, :entry

    TREEBASE = "dc=makerspace,dc=org"

    def self.connect(auth = nil) #initialize LDAP connection to server anonymously
        credentials = { :host => "10.0.0.168",
            :port => "389",
            :auth => auth
        }
        self.new(credentials)
    end

    def self.connect_as_admin #initialize LDAP connection to server with admin privileges.
        auth = { :method => :simple, username: "cn=admin,dc=makerspace,dc=org", password: "makerspace"}

        self.connect(auth)
    end

    def find_by(filter_key, filter_val)
        if self.bind
            @filter = Net::LDAP::Filter.eq(filter_key, filter_val)
            self.search(base: TREEBASE, filter: @filter)
        else
            "Can't bind to LDAP."
        end
    end

    def seed
        attr = {
            name: "Jenna Loranger",
            email: "mail@gmail.com",
            exp_date: "DateTime",
            shops: "Hash of ids" #Shop object belongs to Member. Has many skills.
        }
    end

    def create_entry(attributes)
        last_name = attributes[:name].split(" ").last.strip
        dn = "cn=#{attributes[:name]},#{TREEBASE}"
        attr = {
            cn: attributes[:name],
            objectclass: ["top","inetorgperson"], #top(abstract) > inetorgperson(structural)
            sn: last_name,
            mail: attributes[:email]
        }
        self.add(dn: dn, attributes: attr)
    end
end
